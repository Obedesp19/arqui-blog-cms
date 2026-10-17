from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth.models import AbstractUser, User
from django.conf import settings

class BearerTokenAuthentication(TokenAuthentication):
    keyword = u"Bearer"

class Profiles(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False, default=None)
    creation = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    update = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return "Perfil del usuario "+self.usuario.first_name+" "+self.usuario.last_name
    
#Creamos un modelo para representar las publicaciones en el foro

class Category(models.Model):
    STATUS_CHOICES = [
        ("ACTIVO", "Activo"),
        ("INACTIVO", "Inactivo"),
    ]

    id = models.BigAutoField(primary_key=True)

    nombre = models.CharField(
        max_length=100,
        unique=True,
    )

    descripcion = models.CharField(
        max_length=240,
        blank=True,
        default="",
    )

    estado = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="ACTIVO",
    )

    def __str__(self):
        return self.nombre
   
class Post(models.Model):

    STATUS_CHOICES = [
        ("BORRADOR", "Borrador"),
        ("PENDIENTE_REVISION", "Pendiente de revisión"),
        ("PUBLICADO", "Publicado"),
        ("ARCHIVADO", "Archivado"),
    ]

    id = models.BigAutoField(primary_key=True)

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts'
    )

    title = models.CharField(max_length=255)

    content = models.TextField()

    categoria = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    etiquetas = models.CharField(
        max_length=255,
        blank=True,
        default=''
    )

    estado = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='BORRADOR'
    )

    creation = models.DateTimeField(auto_now_add=True)

    update = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Comment(models.Model):
    STATUS_CHOICES = [
        ("PENDIENTE", "Pendiente de moderación"),
        ("APROBADO", "Aprobado"),
        ("RECHAZADO", "Rechazado"),
    ]

    id = models.BigAutoField(primary_key=True)

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="comments",
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="blog_comments",
    )

    content = models.TextField(max_length=2000)

    estado = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDIENTE",
    )

    moderated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="moderated_blog_comments",
    )

    moderated_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    creation = models.DateTimeField(auto_now_add=True)

    update = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["creation", "id"]
        indexes = [
            models.Index(
                fields=["post", "estado", "creation"],
                name="comment_post_state_created",
            ),
            models.Index(
                fields=["estado", "creation"],
                name="comment_state_created",
            ),
        ]

    def __str__(self):
        return f"Comentario {self.pk} del artículo {self.post_id}"
    
