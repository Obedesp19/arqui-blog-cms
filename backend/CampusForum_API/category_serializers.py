from collections.abc import Mapping

from rest_framework import serializers

from CampusForum_API.models import Category


class CategoryReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "nombre",
            "descripcion",
            "estado",
        )
        read_only_fields = fields


class CategoryWriteSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=100)

    descripcion = serializers.CharField(
        max_length=240,
        allow_blank=True,
        required=False,
    )

    estado = serializers.ChoiceField(
        choices=Category.STATUS_CHOICES,
        required=False,
    )

    def to_internal_value(self, data):
        if isinstance(data, Mapping) and set(data) - set(self.fields):
            raise serializers.ValidationError({
                "detail": (
                    "Solo se acepta nombre, descripcion y estado."
                )
            })

        return super().to_internal_value(data)

    def validate_nombre(self, value):
        return " ".join(value.split())

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError(
                "Envía al menos un campo para guardar."
            )

        return attrs