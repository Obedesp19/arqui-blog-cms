from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from CampusForum_API.models import Category, Comment, Post, UserPreferences
from CampusForum_API.repositories.dashboard_repository import DashboardRepository

class DashboardProfileTests(TestCase):
    def setUp(self):
        self.reader = self.user('reader@example.com', 'LECTOR')
        self.editor = self.user('editor@example.com', 'EDITOR')
        self.writer = self.user('writer@example.com', 'AUTOR')
        self.client = self.client_for(self.reader)

    def user(self, email, role):
        user = get_user_model().objects.create_user(username=email, email=email, password='A-secure-example-42', first_name='Ana María', last_name='De la Cruz Pérez')
        user.groups.add(Group.objects.get_or_create(name=role)[0])
        return user

    def client_for(self, user):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Bearer ' + Token.objects.get_or_create(user=user)[0].key)
        return client

    def post(self, state='PUBLICADO', category=None):
        return Post.objects.create(author=self.writer, title='Conocimiento', content='Contenido completo', estado=state, categoria=category)

    def test_authentication_and_roles(self):
        self.assertEqual(APIClient().get('/dashboard/').status_code, 401)
        self.assertEqual(APIClient().patch('/me/', {'first_name': 'X'}).status_code, 401)
        self.reader.groups.clear()
        self.assertEqual(self.client.get('/dashboard/').status_code, 403)
        self.assertEqual(self.client.patch('/me/', {'first_name': 'X'}).status_code, 403)
        self.reader.is_active = False
        self.reader.save()
        self.assertEqual(self.client.get('/dashboard/').status_code, 401)

    def test_empty_dashboard(self):
        result = self.client.get('/dashboard/')
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.data['published_posts'], 0)
        self.assertEqual(result.data['approved_comments'], 0)
        self.assertEqual(result.data['posts_by_category'], [])
        self.assertIsNone(result.data['editorial'])

    def test_real_counts_visibility_and_live_changes(self):
        cat = Category.objects.create(nombre='Ciencia')
        inactive = Category.objects.create(nombre='Historia', estado='INACTIVO')
        first, second = self.post(category=cat), self.post(category=inactive)
        private = self.post('BORRADOR')
        self.post('PENDIENTE_REVISION')
        self.post('ARCHIVADO')
        Comment.objects.create(post=first, author=self.reader, content='A', estado='APROBADO')
        Comment.objects.create(post=private, author=self.reader, content='Private', estado='APROBADO')
        pending = Comment.objects.create(post=second, author=self.reader, content='Pending')
        Comment.objects.create(post=first, author=self.reader, content='Rejected', estado='RECHAZADO')
        stats = self.client.get('/dashboard/').data
        self.assertEqual((stats['published_posts'], stats['active_categories'], stats['approved_comments']), (2, 1, 1))
        self.assertEqual(sum(r['total'] for r in stats['posts_by_category']), 2)
        self.assertEqual(stats['top_authors'][0]['total'], 2)
        self.assertIsNone(stats['editorial'])
        self.assertIsNone(self.client_for(self.writer).get('/dashboard/').data['editorial'])
        editorial = self.client_for(self.editor).get('/dashboard/').data['editorial']
        self.assertEqual(editorial, {'pending_posts': 1, 'pending_comments': 1})
        admin = self.user('admin@example.com', 'ADMINISTRADOR')
        self.assertEqual(self.client_for(admin).get('/dashboard/').data['editorial'], editorial)
        pending.estado = 'APROBADO'
        pending.save()
        self.assertEqual(self.client.get('/dashboard/').data['approved_comments'], 2)
        first.estado = 'ARCHIVADO'
        first.save()
        stats = self.client.get('/dashboard/').data
        self.assertEqual((stats['published_posts'], stats['approved_comments']), (1, 1))

    def test_uncategorized_and_bounded_queries(self):
        self.post()
        with self.assertNumQueries(6):
            data = DashboardRepository().overview()
        self.assertEqual(data['posts_by_category'][0]['nombre'], 'Sin categoría')
        for _ in range(12): self.post()
        with self.assertNumQueries(6):
            self.assertEqual(DashboardRepository().overview()['published_posts'], 13)

    def test_profile_persists_names_email_avatar_and_login(self):
        token = Token.objects.get(user=self.reader).key
        payload = {'first_name': 'María del Carmen', 'last_name': 'De la Cruz López', 'email': ' NUEVO@example.com ', 'avatar': 'assets/images/avatares/avatar-mono.png'}
        result = self.client.patch('/me/', payload, format='json')
        self.assertEqual(result.status_code, 200, result.data)
        for key in ('first_name', 'last_name', 'avatar'): self.assertEqual(result.data[key], payload[key])
        self.assertEqual(result.data['email'], 'nuevo@example.com')
        self.assertEqual(self.client.get('/me/').data, result.data)
        self.reader.refresh_from_db()
        self.assertEqual(self.reader.username, 'nuevo@example.com')
        self.assertEqual(Token.objects.get(user=self.reader).key, token)
        login = APIClient().post('/token/', {'username': 'nuevo@example.com', 'password': 'A-secure-example-42'}, format='json')
        self.assertEqual(login.status_code, 200, login.data)
        self.assertEqual(login.data['avatar'], payload['avatar'])
        self.assertEqual(APIClient().post('/token/', {'username': 'reader@example.com', 'password': 'A-secure-example-42'}, format='json').status_code, 400)
        self.editor.refresh_from_db()
        self.assertEqual(self.editor.email, 'editor@example.com')

    def test_profile_validation_and_atomicity(self):
        invalid = [{}, {'first_name': ' '}, {'last_name': ''}, {'email': 'invalid'}, {'email': 'EDITOR@example.com'}, {'first_name': 'X', 'email': 'editor@example.com'}, {'avatar': 'https://bad.example/a.svg'}, {'avatar': None}, {'role': 'ADMINISTRADOR'}, {'is_superuser': True}, {'password': 'other'}, {'id': self.editor.pk}, {'first_name': 'A'*151}, {'email': 'a'*145+'@example.com'}]
        for payload in invalid:
            with self.subTest(payload=payload):
                result = self.client.patch('/me/', payload, format='json')
                self.assertEqual(result.status_code, 400, result.data)
                self.reader.refresh_from_db()
                self.assertEqual(self.reader.first_name, 'Ana María')
                self.assertEqual(self.reader.email, 'reader@example.com')
                self.assertFalse(self.reader.is_superuser)
        self.assertFalse(UserPreferences.objects.filter(user=self.reader).exists())

    def test_partial_profile_update(self):
        result = self.client.patch('/me/', {'avatar': 'assets/images/avatares/avatar-original.png'}, format='json')
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.data['first_name'], 'Ana María')
        self.assertEqual(result.data['email'], 'reader@example.com')
        self.assertEqual(result.data['roles'], ['LECTOR'])
