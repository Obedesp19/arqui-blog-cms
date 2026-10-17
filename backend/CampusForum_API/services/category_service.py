from django.db import IntegrityError, transaction

from rest_framework.exceptions import (
    NotFound,
    PermissionDenied,
    ValidationError,
)

from CampusForum_API.category_serializers import CategoryWriteSerializer

from CampusForum_API.repositories.category_repository import (
    CategoryRepository,
)
from CampusForum_API.roles import Roles, has_any_role


class CategoryService:
    def __init__(self, repository=None):
        self.repository = (
            repository
            if repository is not None
            else CategoryRepository()
        )

    def require_manager(self, user):
        if not has_any_role(
            user,
            (Roles.EDITOR, Roles.ADMINISTRADOR),
        ):
            raise PermissionDenied(
                "Esta operación requiere un editor "
                "o administrador activo."
            )

    def require_category(self, category):
        if category is None:
            raise NotFound("Categoría no encontrada.")

        return category

    def validate_data(self, data, partial=False):
        serializer = CategoryWriteSerializer(
            data=data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        return dict(serializer.validated_data)

    def require_unique_name(self, nombre, exclude_id=None):
        if self.repository.name_exists(nombre, exclude_id):
            raise ValidationError({
                "nombre": "Ya existe una categoría con ese nombre."
            })

    def public_list(self):
        return self.repository.list_categories()

    def public_detail(self, pk):
        return self.require_category(
            self.repository.get_category(pk)
        )

    def workspace_list(self, user):
        self.require_manager(user)

        return self.repository.list_categories(
            include_inactive=True,
        )

    def workspace_detail(self, user, pk):
        self.require_manager(user)

        return self.require_category(
            self.repository.get_category(
                pk,
                include_inactive=True,
            )
        )

    def create(self, user, data):
        self.require_manager(user)
        values = self.validate_data(data)

        try:
            with transaction.atomic():
                self.require_unique_name(values["nombre"])
                return self.repository.create(values)
        except IntegrityError:
            # Comprueba si otra petición creó el mismo nombre.
            self.require_unique_name(values["nombre"])
            raise

    def update(self, user, pk, data):
        self.require_manager(user)
        values = self.validate_data(data, partial=True)

        try:
            with transaction.atomic():
                category = self.require_category(
                    self.repository.locked_category(pk)
                )

                if "nombre" in values:
                    self.require_unique_name(
                        values["nombre"],
                        exclude_id=category.pk,
                    )

                return self.repository.update(category, values)
        except IntegrityError:
            if "nombre" in values:
                self.require_unique_name(
                    values["nombre"],
                    exclude_id=pk,
                )
            raise