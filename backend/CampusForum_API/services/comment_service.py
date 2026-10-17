from django.db import transaction
from django.utils import timezone

from rest_framework.exceptions import (
    NotFound,
    PermissionDenied,
    ValidationError,
)

from CampusForum_API.repositories.comment_repository import (
    CommentRepository,
)
from CampusForum_API.roles import Roles, get_user_role


class CommentService:
    def __init__(self, repository=None):
        self.repository = (
            repository
            if repository is not None
            else CommentRepository()
        )

    def require_commenter(self, actor):
        if get_user_role(actor) not in Roles.ALL:
            raise PermissionDenied(
                "Necesitas una cuenta activa con un rol válido."
            )

    def require_moderator(self, actor):
        if get_user_role(actor) not in (
            Roles.EDITOR,
            Roles.ADMINISTRADOR,
        ):
            raise PermissionDenied(
                "Esta operación requiere un editor o administrador."
            )

    def public_list(self, post_id):
        if not self.repository.published_post_exists(post_id):
            raise NotFound("Artículo no encontrado.")

        return self.repository.public_comments(post_id)

    def workspace_list(self, actor, estado):
        self.require_moderator(actor)

        if estado not in (
            "PENDIENTE",
            "APROBADO",
            "RECHAZADO",
            "TODOS",
        ):
            raise ValidationError({
                "estado": "Filtro de estado inválido."
            })

        return self.repository.workspace_comments(estado)

    @transaction.atomic
    def create(self, actor, post_id, content):
        self.require_commenter(actor)

        if not isinstance(content, str):
            raise ValidationError({
                "content": "El comentario debe ser texto."
            })

        content = content.strip()

        if not content or len(content) > 2000:
            raise ValidationError({
                "content": (
                    "Escribe un comentario de entre 1 y 2000 caracteres."
                )
            })

        post = self.repository.locked_post(post_id)

        if post is None or post.estado != "PUBLICADO":
            raise NotFound("Artículo no encontrado.")

        return self.repository.create(
            post,
            actor,
            content,
        )

    @transaction.atomic
    def moderate(self, actor, comment_id, action):
        self.require_moderator(actor)

        if action not in ("APROBAR", "RECHAZAR"):
            raise ValidationError({
                "action": "Acción de moderación inválida."
            })

        post_id = self.repository.comment_post_id(comment_id)

        if post_id is None:
            raise NotFound("Comentario no encontrado.")

        # Bloquea primero el artículo y después el comentario.
        post = self.repository.locked_post(post_id)

        if post is None:
            raise NotFound("Artículo no encontrado.")

        comment = self.repository.locked_comment(
            comment_id,
            post_id,
        )

        if comment is None:
            raise NotFound("Comentario no encontrado.")

        if comment.estado != "PENDIENTE":
            raise ValidationError({
                "action": "El comentario ya fue moderado."
            })

        if action == "APROBAR" and post.estado != "PUBLICADO":
            raise ValidationError({
                "action": (
                    "Solo puedes aprobar comentarios "
                    "de artículos publicados."
                )
            })

        estado = (
            "APROBADO"
            if action == "APROBAR"
            else "RECHAZADO"
        )

        return self.repository.moderate(
            comment,
            actor,
            estado,
            timezone.now(),
        )