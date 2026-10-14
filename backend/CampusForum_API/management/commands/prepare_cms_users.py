from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from CampusForum_API.repositories.user_admin_repository import (
    LEGACY_ROLES,
    UserAdminRepository,
)
from CampusForum_API.roles import Roles


class Command(BaseCommand):
    help = (
        "Convierte roles antiguos y asigna "
        "una cuenta administradora existente."
    )

    def add_arguments(self, parser):
        parser.add_argument("--admin-email", required=True)
        parser.add_argument("--dry-run", action="store_true")

    @transaction.atomic
    def handle(self, *args, **options):
        User = get_user_model()
        email = options["admin_email"].strip().lower()

        matches = list(
            User.objects.filter(email__iexact=email)
        )

        if len(matches) != 1:
            raise CommandError(
                "El correo debe identificar exactamente "
                "una cuenta existente."
            )

        admin_id = matches[0].pk

        for role in Roles.ALL:
            Group.objects.get_or_create(name=role)

        repository = UserAdminRepository()
        repository.lock_administration()

        users = list(
            User.objects.select_for_update().order_by("pk")
        )

        admin = next(
            user for user in users if user.pk == admin_id
        )

        if not admin.is_active:
            raise CommandError(
                "La cuenta administradora elegida está desactivada."
            )

        if admin.username != email:
            raise CommandError(
                "El username de esa cuenta debe coincidir "
                "con su correo en minúsculas para usar el login actual."
            )

        plan = []

        for user in users:
            names = set(
                user.groups.values_list("name", flat=True)
            )
            current = names.intersection(Roles.ALL)

            if len(current) > 1:
                raise CommandError(
                    f"El usuario ID {user.pk} tiene varios roles CMS. "
                    "Revisa su asignación."
                )

            if user.pk == admin_id or user.is_superuser:
                desired = Roles.ADMINISTRADOR
            else:
                desired = (
                    next(iter(current))
                    if current
                    else Roles.LECTOR
                )

            if (
                current != {desired}
                or names.intersection(LEGACY_ROLES)
            ):
                plan.append((user, desired))

        for user, role in plan:
            self.stdout.write(
                f"Usuario ID {user.pk}: asignar {role}; "
                "retirar roles antiguos e invalidar token."
            )

            repository.set_role(user, role)
            repository.delete_tokens(user)

        if options["dry_run"]:
            transaction.set_rollback(True)

            self.stdout.write(
                self.style.SUCCESS(
                    "Simulación terminada: ningún cambio guardado."
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    "Preparación completada. "
                    f"Cuentas actualizadas: {len(plan)}."
                )
            )