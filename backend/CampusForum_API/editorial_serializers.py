from collections.abc import Mapping

from rest_framework import serializers


EDITORIAL_ACTIONS = (
    "ENVIAR_REVISION",
    "DEVOLVER",
    "PUBLICAR",
    "ARCHIVAR",
    "RECUPERAR",
)


class EditorialActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=EDITORIAL_ACTIONS,
    )

    def to_internal_value(self, data):
        if isinstance(data, Mapping) and set(data) - {"action"}:
            raise serializers.ValidationError({
                "detail": "Solo se acepta el campo action."
            })

        return super().to_internal_value(data)