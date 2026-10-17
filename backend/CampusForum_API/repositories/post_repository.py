from django.db.models.functions import Substr

from CampusForum_API.models import Category, Post


class PostRepository:
    def list_queryset(self, queryset):
        return (
            queryset
            .select_related("author", "categoria")
            .annotate(
                excerpt_source=Substr("content", 1, 181),
            )
            .defer("content")
            .order_by("-creation", "-id")
        )

    def public_posts(self):
        return self.list_queryset(
            Post.objects.filter(estado="PUBLICADO")
        )

    def public_post(self, pk):
        return (
            Post.objects
            .filter(
                pk=pk,
                estado="PUBLICADO",
            )
            .select_related("author", "categoria")
            .first()
        )

    def workspace_queryset(self, user_id, can_manage):
        queryset = Post.objects.all()

        if not can_manage:
            queryset = queryset.filter(author_id=user_id)

        return queryset

    def workspace_posts(self, user_id, can_manage):
        return self.list_queryset(
            self.workspace_queryset(user_id, can_manage)
        )

    def workspace_post(self, pk, user_id, can_manage):
        return (
            self.workspace_queryset(user_id, can_manage)
            .filter(pk=pk)
            .select_related("author", "categoria")
            .first()
        )

    def locked_post(self, pk, user_id, can_manage):
        queryset = Post.objects.select_for_update().filter(pk=pk)

        if not can_manage:
            queryset = queryset.filter(author_id=user_id)

        return queryset.first()

    def category_for_assignment(self, category_id):
        return (
            Category.objects
            .select_for_update()
            .filter(pk=category_id)
            .first()
        )

    def create(self, author, data):
        return Post.objects.create(
            author=author,
            estado="BORRADOR",
            **data,
        )

    def update(self, post, data):
        for field, value in data.items():
            setattr(post, field, value)

        post.save()
        return post

    def delete(self, post):
        post.delete()