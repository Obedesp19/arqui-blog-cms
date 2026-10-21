from rest_framework.exceptions import PermissionDenied
from CampusForum_API.repositories.dashboard_repository import DashboardRepository
from CampusForum_API.roles import Roles, get_user_role


class DashboardService:
    def __init__(self, repository=None):
        self.repository = repository if repository is not None else DashboardRepository()

    def overview(self, user):
        role = get_user_role(user)
        if role is None:
            raise PermissionDenied("La cuenta no tiene un rol activo del CMS.")
        return self.repository.overview(editorial=role in (Roles.EDITOR, Roles.ADMINISTRADOR))
