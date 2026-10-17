from collections.abc import Mapping

from django.contrib.auth import get_user_model
from rest_framework import serializers

from CampusForum_API.models import Comment, Post


class StrictFieldsMixin:
    def to_internal_value(self, data):
        if isinstance(data, Mapping) and set(data) - set(self.fields):
            raise serializers.ValidationError({
                "detail": "La solicitud contiene campos no permitidos."
            })

        return super().to_internal_value(data)


class CommentAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ("id", "first_name", "last_name")


class CommentReadSerializer(serializers.ModelSerializer):
    author = CommentAuthorSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = (
            "id",
            "post_id",
            "author",
            "content",
            "estado",
            "creation",
            "update",
        )
        read_only_fields = fields


class CommentPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ("id", "title", "estado")


class WorkspaceCommentSerializer(serializers.ModelSerializer):
    author = CommentAuthorSerializer(read_only=True)
    post = CommentPostSerializer(read_only=True)
    moderated_by = CommentAuthorSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = (
            "id",
            "post",
            "author",
            "content",
            "estado",
            "moderated_by",
            "moderated_at",
            "creation",
            "update",
        )
        read_only_fields = fields


class CommentWriteSerializer(
    StrictFieldsMixin,
    serializers.Serializer,
):
    content = serializers.CharField(
        max_length=2000,
        allow_blank=False,
        trim_whitespace=True,
    )


class CommentModerationSerializer(
    StrictFieldsMixin,
    serializers.Serializer,
):
    action = serializers.ChoiceField(
        choices=("APROBAR", "RECHAZAR"),
    )


class CommentFilterSerializer(serializers.Serializer):
    estado = serializers.ChoiceField(
        choices=(
            "PENDIENTE",
            "APROBADO",
            "RECHAZADO",
            "TODOS",
        ),
        default="PENDIENTE",
    )