from collections.abc import Mapping

from django.contrib.auth import get_user_model
from rest_framework import serializers

from CampusForum_API.roles import Roles


class AdminUserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()

        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "roles",
            "is_active",
            "is_superuser",
        )

    def get_roles(self, user):
        if user.is_superuser:
            return [Roles.ADMINISTRADOR]

        return sorted(
            group.name
            for group in user.groups.all()
            if group.name in Roles.ALL
        )


class AdminUserUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(
        choices=Roles.ALL,
        required=False,
    )

    is_active = serializers.BooleanField(required=False)

    def to_internal_value(self, data):
        if (
            isinstance(data, Mapping)
            and set(data) - {"role", "is_active"}
        ):
            raise serializers.ValidationError({
                "detail": "Solo se acepta role e is_active."
            })

        return super().to_internal_value(data)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError(
                "Envía al menos role o is_active."
            )

        return attrs