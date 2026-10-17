from CampusForum_API.models import Comment, Post


class CommentRepository:
    def published_post_exists(self, post_id):
        return Post.objects.filter(
            pk=post_id,
            estado="PUBLICADO",
        ).exists()

    def public_comments(self, post_id):
        return (
            Comment.objects
            .filter(
                post_id=post_id,
                post__estado="PUBLICADO",
                estado="APROBADO",
            )
            .select_related("author")
            .order_by("creation", "id")
        )

    def workspace_comments(self, estado):
        queryset = Comment.objects.all()

        if estado != "TODOS":
            queryset = queryset.filter(estado=estado)

        return (
            queryset
            .select_related("author", "post", "moderated_by")
            .order_by("creation", "id")
        )

    def locked_post(self, post_id):
        return (
            Post.objects
            .select_for_update()
            .filter(pk=post_id)
            .first()
        )

    def comment_post_id(self, comment_id):
        return (
            Comment.objects
            .filter(pk=comment_id)
            .values_list("post_id", flat=True)
            .first()
        )

    def locked_comment(self, comment_id, post_id):
        return (
            Comment.objects
            .select_for_update()
            .filter(
                pk=comment_id,
                post_id=post_id,
            )
            .first()
        )

    def create(self, post, author, content):
        return Comment.objects.create(
            post=post,
            author=author,
            content=content,
            estado="PENDIENTE",
        )

    def moderate(self, comment, actor, estado, moderated_at):
        comment.estado = estado
        comment.moderated_by = actor
        comment.moderated_at = moderated_at
        comment.save()

        return comment