from django.db import transaction

from rest_framework.exceptions import (
    NotFound,
    PermissionDenied,
    ValidationError,
)

from CampusForum_API.repositories.user_admin_repository import (
    UserAdminRepository,
)
from CampusForum_API.roles import Roles, get_user_role


class UserAdminService:
    def __init__(self, repository=None):
        self.repository = (
            repository
            if repository is not None
            else UserAdminRepository()
        )

    def require_admin(self, user):
        if get_user_role(user) != Roles.ADMINISTRADOR:
            raise PermissionDenied(
                "Esta operación requiere un administrador activo."
            )

    def list_users(self, actor):
        self.require_admin(actor)
        return self.repository.list_users()

    @transaction.atomic
    def update_user(self, actor, user_id, data):
        self.require_admin(actor)

        if not data or set(data) - {"role", "is_active"}:
            raise ValidationError(
                "Solo se puede modificar role o is_active."
            )

        if "role" in data and data["role"] not in Roles.ALL:
            raise ValidationError({
                "role": "Rol inválido."
            })

        if (
            "is_active" in data
            and type(data["is_active"]) is not bool
        ):
            raise ValidationError({
                "is_active": "Debe ser un booleano."
            })

        # Ordena los cambios administrativos concurrentes.
        self.repository.lock_administration()

        # Vuelve a leer al administrador para verificar su estado actual.
        actor = self.repository.get_locked_user(actor.pk)
        self.require_admin(actor)

        target = self.repository.get_locked_user(user_id)

        if target is None:
            raise NotFound("Usuario no encontrado.")

        if target.pk == actor.pk:
            raise ValidationError(
                "No puedes modificar tu propia cuenta "
                "desde este endpoint."
            )

        if target.is_superuser:
            raise PermissionDenied(
                "La cuenta técnica de superusuario "
                "se administra fuera de esta API."
            )

        if "role" in data:
            self.repository.set_role(target, data["role"])

        if "is_active" in data:
            self.repository.set_active(target, data["is_active"])

        self.repository.delete_tokens(target)

        return target