from django.contrib.auth import get_user_model
from django.db.models import Q
from CampusForum_API.models import UserPreferences
from CampusForum_API.profile_serializers import DEFAULT_AVATAR


class ProfileRepository:
    def locked_user(self, user_id):
        return get_user_model().objects.select_for_update().get(pk=user_id)

    def email_exists(self, email, user_id):
        return get_user_model().objects.exclude(pk=user_id).filter(
            Q(email__iexact=email) | Q(username__iexact=email)
        ).exists()

    def avatar(self, user):
        return (UserPreferences.objects.filter(user=user)
                .values_list("avatar", flat=True).first() or DEFAULT_AVATAR)

    def update(self, user, data):
        fields = []
        for name in ("first_name", "last_name", "email"):
            if name in data:
                setattr(user, name, data[name])
                fields.append(name)
        if "email" in data:
            user.username = data["email"]
            fields.append("username")
        if fields:
            user.save(update_fields=fields)
        if "avatar" in data:
            UserPreferences.objects.update_or_create(user=user, defaults={"avatar": data["avatar"]})
        return user
