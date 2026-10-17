from django.db import transaction
from rest_framework.exceptions import (
    NotFound,
    PermissionDenied,
    ValidationError,
)

from CampusForum_API.repositories.post_repository import PostRepository
from CampusForum_API.roles import Roles, get_user_role


class PostService:
    def __init__(self, repository=None):
        self.repository = (
            repository if repository is not None else PostRepository()
        )

    def require_writer(self, user):
        role = get_user_role(user)

        if role not in (
            Roles.AUTOR,
            Roles.EDITOR,
            Roles.ADMINISTRADOR,
        ):
            raise PermissionDenied(
                "Tu rol no permite gestionar artículos."
            )

        return role

    def can_manage(self, role):
        return role in (Roles.EDITOR, Roles.ADMINISTRADOR)

    def require_post(self, post):
        if post is None:
            raise NotFound("Artículo no encontrado.")

        return post

    def validate_data(self, data, post=None):
        allowed_fields = {
            "title",
            "content",
            "categoria_id",
            "etiquetas",
        }

        if set(data) - allowed_fields:
            raise ValidationError(
                "No puedes modificar el autor o el estado "
                "desde esta operación."
            )

        if "categoria_id" not in data:
            return

        category_id = data["categoria_id"]

        if category_id is None:
            return

        category = self.repository.category_for_assignment(
            category_id
        )

        if category is None:
            raise ValidationError({
                "categoria_id": "La categoría no existe."
            })

        keeps_current_category = (
            post is not None
            and post.categoria_id == category_id
        )

        if (
            category.estado != "ACTIVO"
            and not keeps_current_category
        ):
            raise ValidationError({
                "categoria_id": (
                    "No puedes asignar una categoría inactiva."
                )
            })

    def public_list(self):
        return self.repository.public_posts()

    def public_detail(self, pk):
        return self.require_post(
            self.repository.public_post(pk)
        )

    def workspace_list(self, user):
        role = self.require_writer(user)

        return self.repository.workspace_posts(
            user.pk,
            self.can_manage(role),
        )

    def workspace_detail(self, user, pk):
        role = self.require_writer(user)

        return self.require_post(
            self.repository.workspace_post(
                pk,
                user.pk,
                self.can_manage(role),
            )
        )

    @transaction.atomic
    def create(self, user, data):
        self.require_writer(user)
        self.validate_data(data)

        return self.repository.create(user, dict(data))

    @transaction.atomic
    def update(self, user, pk, data, partial=True):
        role = self.require_writer(user)

        post = self.require_post(
            self.repository.locked_post(
                pk,
                user.pk,
                self.can_manage(role),
            )
        )

        if post.estado != "BORRADOR":
            raise PermissionDenied(
                "Solo se pueden editar borradores. "
                "Los otros estados requieren el flujo editorial."
            )

        self.validate_data(data, post=post)
        changes = dict(data)

        if not partial:
            changes.setdefault("categoria_id", None)
            changes.setdefault("etiquetas", "")

        return self.repository.update(post, changes)

    @transaction.atomic
    def delete(self, user, pk):
        role = self.require_writer(user)

        post = self.require_post(
            self.repository.locked_post(
                pk,
                user.pk,
                self.can_manage(role),
            )
        )

        if role == Roles.AUTOR and post.estado != "BORRADOR":
            raise PermissionDenied(
                "Un autor solo puede eliminar sus propios borradores."
            )

        self.repository.delete(post)