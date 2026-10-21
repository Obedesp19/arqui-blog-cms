from collections.abc import Mapping
from rest_framework import serializers

AVATARS = tuple(
    f"assets/images/avatares/{name}.png" for name in (
        "avatar-original", "avatar-lentes", "avatar-gorra-lentes",
        "avatar-mono", "avatar-navidad", "avatar-navidad-lentes",
    )
)
DEFAULT_AVATAR = AVATARS[2]


class ProfileUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(max_length=150, required=False)
    avatar = serializers.ChoiceField(choices=AVATARS, required=False)

    def to_internal_value(self, data):
        if isinstance(data, Mapping) and set(data) - set(self.fields):
            raise serializers.ValidationError({"detail": "Solo puedes modificar nombre, apellidos, correo y avatar."})
        return super().to_internal_value(data)

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Envía al menos un dato para actualizar.")
        return attrs
