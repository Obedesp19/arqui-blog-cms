"""Roles y comprobaciones comunes de autorización del CMS."""


class Roles:
    LECTOR = "LECTOR"
    AUTOR = "AUTOR"
    EDITOR = "EDITOR"
    ADMINISTRADOR = "ADMINISTRADOR"

    ALL = (
        LECTOR,
        AUTOR,
        EDITOR,
        ADMINISTRADOR,
    )


def get_user_role(user):
    """Devuelve el rol válido del usuario, o None si no tiene acceso."""

    if (
        user is None
        or not user.is_authenticated
        or not user.is_active
    ):
        return None

    # El superusuario es la cuenta técnica de administración inicial.
    if user.is_superuser:
        return Roles.ADMINISTRADOR

    assigned_roles = list(
        user.groups.filter(
            name__in=Roles.ALL
        ).values_list("name", flat=True)
    )

    # Una asignación inexistente o ambigua no concede permisos.
    if len(assigned_roles) != 1:
        return None

    return assigned_roles[0]


def has_any_role(user, allowed_roles):
    """Comprueba si el usuario tiene uno de los roles permitidos."""

    role = get_user_role(user)

    return role is not None and role in allowed_roles