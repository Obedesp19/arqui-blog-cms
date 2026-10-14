from collections.abc import Mapping

from rest_framework import serializers


class RegistrationSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField(max_length=150)

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        min_length=8,
    )

    def to_internal_value(self, data):
        forbidden = {
            "role",
            "roles",
            "rol",
            "groups",
            "is_staff",
            "is_superuser",
            "is_active",
            "user_permissions",
        }

        if isinstance(data, Mapping) and forbidden.intersection(data):
            raise serializers.ValidationError({
                "detail": (
                    "El registro público no acepta roles ni permisos."
                )
            })

        return super().to_internal_value(data)

    def validate_email(self, value):
        return value.lower()


class LoginSerializer(serializers.Serializer):
    username = serializers.EmailField(max_length=150)

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate_username(self, value):
        return value.lower()