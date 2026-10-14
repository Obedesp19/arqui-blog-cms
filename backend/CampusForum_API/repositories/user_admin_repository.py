from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

from CampusForum_API.repositories.user_repository import UserRepository
from CampusForum_API.roles import Roles

User = get_user_model()

LEGACY_ROLES = (
    "estudiante",
    "profesor",
    "ESTUDIANTE",
    "PROFESOR",
)


class UserAdminRepository(UserRepository):
    def list_users(self):
        return User.objects.prefetch_related("groups").order_by("id")

    def lock_administration(self):
        Group.objects.select_for_update().get(
            name=Roles.ADMINISTRADOR
        )

    def get_locked_user(self, user_id):
        return (
            User.objects.select_for_update()
            .filter(pk=user_id)
            .first()
        )

    def set_role(self, user, role):
        old_groups = list(
            Group.objects.filter(
                name__in=Roles.ALL + LEGACY_ROLES
            )
        )

        user.groups.remove(*old_groups)
        user.groups.add(Group.objects.get(name=role))

    def set_active(self, user, is_active):
        user.is_active = is_active
        user.save(update_fields=["is_active"])