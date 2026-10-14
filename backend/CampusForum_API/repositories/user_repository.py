from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db.models import Q
from rest_framework.authtoken.models import Token

from CampusForum_API.models import Profiles

User = get_user_model()


class UserRepository:
    def email_exists(self, email):
        return User.objects.filter(
            Q(email__iexact=email) | Q(username__iexact=email)
        ).exists()

    def create_user(self, data, role):
        user = User.objects.create_user(
            username=data["email"],
            email=data["email"],
            password=data["password"],
            first_name=data["first_name"],
            last_name=data["last_name"],
        )

        group, _ = Group.objects.get_or_create(name=role)
        user.groups.add(group)

        profile = Profiles.objects.create(user=user)

        return user, profile

    def get_or_create_token(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        return token.key

    def delete_tokens(self, user):
        Token.objects.filter(user=user).delete()