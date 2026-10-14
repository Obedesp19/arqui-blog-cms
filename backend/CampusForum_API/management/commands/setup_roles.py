"""Crea los grupos correspondientes a los cuatro roles del CMS."""

from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand
from django.db import transaction

from CampusForum_API.roles import Roles


class Command(BaseCommand):
    help = "Crea los cuatro roles del CMS si todavía no existen."

    @transaction.atomic
    def handle(self, *args, **options):
        for role_name in Roles.ALL:
            _, created = Group.objects.get_or_create(
                name=role_name
            )

            result = "creado" if created else "ya existe"

            self.stdout.write(f"{role_name}: {result}")

        self.stdout.write(
            self.style.SUCCESS(
                "Los cuatro roles del CMS están disponibles."
            )
        )