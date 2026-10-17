from collections.abc import Mapping

from django.contrib.auth import get_user_model
from rest_framework import serializers

from CampusForum_API.models import Category, Post


class PostAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ("id", "first_name", "last_name")


class PostCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "nombre")

class PostListSerializer(serializers.ModelSerializer):
    author = PostAuthorSerializer(read_only=True)
    categoria = PostCategorySerializer(read_only=True)
    excerpt = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id",
            "title",
            "excerpt",
            "categoria",
            "etiquetas",
            "estado",
            "author",
            "creation",
            "update",
        )
        read_only_fields = fields

    def get_excerpt(self, post):
        value = post.excerpt_source

        if len(value) > 180:
            return value[:180] + "…"

        return value

class PostReadSerializer(serializers.ModelSerializer):
    author = PostAuthorSerializer(read_only=True)
    categoria = PostCategorySerializer(read_only=True)

    class Meta:
        model = Post
        fields = (
            "id",
            "title",
            "content",
            "categoria",
            "etiquetas",
            "estado",
            "author",
            "creation",
            "update",
        )
        read_only_fields = fields


class PostWriteSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    content = serializers.CharField(trim_whitespace=False)

    categoria_id = serializers.IntegerField(
        min_value=1,
        allow_null=True,
        required=False,
    )

    etiquetas = serializers.CharField(
        max_length=255,
        allow_blank=True,
        required=False,
    )

    def to_internal_value(self, data):
        if isinstance(data, Mapping) and set(data) - set(self.fields):
            raise serializers.ValidationError({
                "detail": (
                    "Solo se acepta title, content, categoria_id y etiquetas. "
                    "El autor y el estado los controla el servidor."
                )
            })

        return super().to_internal_value(data)

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El contenido no puede estar vacío."
            )

        return value

    def validate_etiquetas(self, value):
        normalized = []
        seen = set()

        for fragment in value.split(","):
            label = " ".join(fragment.split())

            if not label:
                continue

            key = label.casefold()

            if key in seen:
                continue

            seen.add(key)
            normalized.append(label)

        result = ", ".join(normalized)

        if len(result) > 255:
            raise serializers.ValidationError(
                "Las etiquetas no pueden superar los 255 caracteres."
            )

        return result