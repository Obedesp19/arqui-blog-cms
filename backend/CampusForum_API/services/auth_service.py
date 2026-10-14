from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction

from rest_framework.exceptions import PermissionDenied, ValidationError

from CampusForum_API.repositories.user_repository import UserRepository
from CampusForum_API.roles import Roles, get_user_role


class AuthService:
    def __init__(self, repository=None):
        self.repository = (
            repository if repository is not None else UserRepository()
        )

    def register(self, data):
        if self.repository.email_exists(data["email"]):
            raise ValidationError({
                "email": ["Este correo ya está registrado."]
            })

        candidate = get_user_model()(
            username=data["email"],
            email=data["email"],
            first_name=data["first_name"],
            last_name=data["last_name"],
        )

        try:
            validate_password(data["password"], user=candidate)
        except DjangoValidationError as exc:
            raise ValidationError({
                "password": exc.messages
            }) from exc

        try:
            with transaction.atomic():
                user, profile = self.repository.create_user(
                    data,
                    Roles.LECTOR,
                )
        except IntegrityError as exc:
            raise ValidationError({
                "email": [
                    "No se pudo crear la cuenta. "
                    "El correo puede estar registrado."
                ]
            }) from exc

        return {
            "id": user.pk,
            "profile_created_id": profile.pk,
        }

    def current_user(self, user):
        role = get_user_role(user)

        if role is None:
            raise PermissionDenied(
                "La cuenta no tiene un rol válido del CMS. "
                "Contacta al administrador."
            )

        return {
            "id": user.pk,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "roles": [role],
        }

    def login(self, request, data):
        user = authenticate(
            request=request,
            username=data["username"],
            password=data["password"],
        )

        if user is None:
            raise ValidationError({
                "detail": "Correo o contraseña incorrectos."
            })

        result = self.current_user(user)
        result["token"] = self.repository.get_or_create_token(user)

        return result

    def logout(self, user):
        self.repository.delete_tokens(user)