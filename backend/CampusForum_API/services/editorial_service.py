from django.db import transaction

from rest_framework.exceptions import (
    NotFound,
    PermissionDenied,
    ValidationError,
)

from CampusForum_API.editorial_serializers import EDITORIAL_ACTIONS
from CampusForum_API.repositories.post_repository import PostRepository
from CampusForum_API.roles import Roles, get_user_role


class EditorialService:
    TRANSITIONS = {
        "ENVIAR_REVISION": (
            "BORRADOR",
            "PENDIENTE_REVISION",
        ),
        "DEVOLVER": (
            "PENDIENTE_REVISION",
            "BORRADOR",
        ),
        "PUBLICAR": (
            "PENDIENTE_REVISION",
            "PUBLICADO",
        ),
        "ARCHIVAR": (
            "PUBLICADO",
            "ARCHIVADO",
        ),
        "RECUPERAR": (
            "ARCHIVADO",
            "BORRADOR",
        ),
    }

    def __init__(self, repository=None):
        self.repository = (
            repository
            if repository is not None
            else PostRepository()
        )

    @transaction.atomic
    def transition(self, actor, post_id, action):
        role = get_user_role(actor)

        if role not in (
            Roles.AUTOR,
            Roles.EDITOR,
            Roles.ADMINISTRADOR,
        ):
            raise PermissionDenied(
                "Tu rol no permite realizar acciones editoriales."
            )

        if action not in EDITORIAL_ACTIONS:
            raise ValidationError({
                "action": "Acción editorial inválida."
            })

        can_manage = role in (
            Roles.EDITOR,
            Roles.ADMINISTRADOR,
        )

        if not can_manage and action != "ENVIAR_REVISION":
            raise PermissionDenied(
                "Esta acción requiere un editor o administrador."
            )

        post = self.repository.locked_post(
            post_id,
            actor.pk,
            can_manage,
        )

        if post is None:
            raise NotFound("Artículo no encontrado.")

        expected_state, next_state = self.TRANSITIONS[action]

        if post.estado != expected_state:
            raise ValidationError({
                "action": (
                    f"La acción {action} requiere el estado "
                    f"{expected_state}. "
                    f"El artículo está en {post.estado}."
                )
            })

        return self.repository.update(
            post,
            {"estado": next_state},
        )