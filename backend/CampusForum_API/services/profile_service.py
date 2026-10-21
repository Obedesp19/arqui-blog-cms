from django.db import IntegrityError, transaction
from rest_framework.exceptions import PermissionDenied, ValidationError
from CampusForum_API.profile_serializers import ProfileUpdateSerializer
from CampusForum_API.repositories.profile_repository import ProfileRepository
from CampusForum_API.roles import get_user_role


class ProfileService:
    def __init__(self, repository=None):
        self.repository = repository if repository is not None else ProfileRepository()

    def update(self, actor, data):
        serializer = ProfileUpdateSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        changes = serializer.validated_data
        try:
            with transaction.atomic():
                user = self.repository.locked_user(actor.pk)
                if get_user_role(user) is None:
                    raise PermissionDenied("La cuenta no tiene un rol activo del CMS.")
                if "email" in changes and self.repository.email_exists(changes["email"], user.pk):
                    raise ValidationError({"email": "Este correo ya está registrado."})
                return self.repository.update(user, changes)
        except IntegrityError as exc:
            raise ValidationError({"email": "No se pudo guardar. El correo puede estar registrado."}) from exc
