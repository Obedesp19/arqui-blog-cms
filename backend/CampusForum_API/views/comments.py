from rest_framework import permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from CampusForum_API.comment_serializers import (
    CommentFilterSerializer,
    CommentModerationSerializer,
    CommentReadSerializer,
    CommentWriteSerializer,
    WorkspaceCommentSerializer,
)
from CampusForum_API.models import BearerTokenAuthentication
from CampusForum_API.permissions import IsEditorOrAdministrator
from CampusForum_API.services.comment_service import CommentService


class CommentPagination(PageNumberPagination):
    page_size = 20


def paginated_comments(queryset, request, view, serializer_class):
    paginator = CommentPagination()
    page = paginator.paginate_queryset(
        queryset,
        request,
        view=view,
    )

    return paginator.get_paginated_response(
        serializer_class(page, many=True).data
    )


class PostCommentsView(APIView):
    authentication_classes = [BearerTokenAuthentication]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]

        return [permissions.IsAuthenticated()]

    def get(self, request, pk):
        comments = CommentService().public_list(pk)

        return paginated_comments(
            comments,
            request,
            self,
            CommentReadSerializer,
        )

    def post(self, request, pk):
        serializer = CommentWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comment = CommentService().create(
            request.user,
            pk,
            serializer.validated_data["content"],
        )

        return Response(
            CommentReadSerializer(comment).data,
            status=status.HTTP_201_CREATED,
        )


class WorkspaceCommentsView(APIView):
    authentication_classes = [BearerTokenAuthentication]

    permission_classes = [
        permissions.IsAuthenticated,
        IsEditorOrAdministrator,
    ]

    def get(self, request):
        serializer = CommentFilterSerializer(
            data=request.query_params,
        )
        serializer.is_valid(raise_exception=True)

        comments = CommentService().workspace_list(
            request.user,
            serializer.validated_data["estado"],
        )

        return paginated_comments(
            comments,
            request,
            self,
            WorkspaceCommentSerializer,
        )


class CommentModerationView(APIView):
    authentication_classes = [BearerTokenAuthentication]

    permission_classes = [
        permissions.IsAuthenticated,
        IsEditorOrAdministrator,
    ]

    def post(self, request, pk):
        serializer = CommentModerationSerializer(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)

        comment = CommentService().moderate(
            request.user,
            pk,
            serializer.validated_data["action"],
        )

        return Response(
            WorkspaceCommentSerializer(comment).data,
        )