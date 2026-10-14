"""Permisos reutilizables para los endpoints del CMS."""

from rest_framework.permissions import BasePermission

from CampusForum_API.roles import Roles, has_any_role


class IsCmsAdministrator(BasePermission):
    """Permite el acceso a administradores del CMS."""

    message = "Esta operación requiere el rol de administrador."

    def has_permission(self, request, view):
        return has_any_role(
            request.user,
            (Roles.ADMINISTRADOR,),
        )


class IsEditorOrAdministrator(BasePermission):
    """Permite operaciones editoriales y de moderación."""

    message = "Esta operación requiere el rol de editor o administrador."

    def has_permission(self, request, view):
        return has_any_role(
            request.user,
            (
                Roles.EDITOR,
                Roles.ADMINISTRADOR,
            ),
        )


class CanCreatePosts(BasePermission):
    """Permite crear artículos a autores, editores y administradores."""

    message = "Tu rol no permite crear artículos."

    def has_permission(self, request, view):
        return has_any_role(
            request.user,
            (
                Roles.AUTOR,
                Roles.EDITOR,
                Roles.ADMINISTRADOR,
            ),
        )