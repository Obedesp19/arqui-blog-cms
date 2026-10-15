from CampusForum_API.models import Category, Post


class PostRepository:
    def public_posts(self):
        return (
            Post.objects
            .filter(estado="PUBLICADO")
            .select_related("author", "categoria")
            .order_by("-creation", "-id")
        )

    def public_post(self, pk):
        return self.public_posts().filter(pk=pk).first()

    def workspace_posts(self, user_id, can_manage):
        queryset = Post.objects.all()

        if not can_manage:
            queryset = queryset.filter(author_id=user_id)

        return (
            queryset
            .select_related("author", "categoria")
            .order_by("-creation", "-id")
        )

    def workspace_post(self, pk, user_id, can_manage):
        return (
            self.workspace_posts(user_id, can_manage)
            .filter(pk=pk)
            .first()
        )

    def locked_post(self, pk, user_id, can_manage):
        queryset = Post.objects.select_for_update().filter(pk=pk)

        if not can_manage:
            queryset = queryset.filter(author_id=user_id)

        return queryset.first()

    def category_exists(self, category_id):
        return Category.objects.filter(pk=category_id).exists()

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