from CampusForum_API.post_serializers import (
    PostListSerializer,
    PostReadSerializer,
    PostWriteSerializer,
)
from rest_framework import permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from CampusForum_API.models import BearerTokenAuthentication
from CampusForum_API.permissions import CanCreatePosts
from CampusForum_API.post_serializers import (
    PostReadSerializer,
    PostWriteSerializer,
)
from CampusForum_API.services.post_service import PostService


class PostsPagination(PageNumberPagination):
    page_size = 10


def paginated_posts(queryset, request, view):
    paginator = PostsPagination()

    page = paginator.paginate_queryset(
        queryset,
        request,
        view=view,
    )

    return paginator.get_paginated_response(
        PostListSerializer(page, many=True).data
    )


class PublicPostBase(APIView):
    authentication_classes = [BearerTokenAuthentication]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]

        return [
            permissions.IsAuthenticated(),
            CanCreatePosts(),
        ]


class PostsView(PublicPostBase):
    def get(self, request):
        return paginated_posts(
            PostService().public_list(),
            request,
            self,
        )

    def post(self, request):
        serializer = PostWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        post = PostService().create(
            request.user,
            serializer.validated_data,
        )

        return Response(
            PostReadSerializer(post).data,
            status=status.HTTP_201_CREATED,
        )


class PostDetailView(PublicPostBase):
    def get(self, request, pk):
        post = PostService().public_detail(pk)
        return Response(PostReadSerializer(post).data)

    def patch(self, request, pk):
        return self.update_post(request, pk, partial=True)

    def put(self, request, pk):
        return self.update_post(request, pk, partial=False)

    def update_post(self, request, pk, partial):
        serializer = PostWriteSerializer(
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)

        post = PostService().update(
            request.user,
            pk,
            serializer.validated_data,
            partial=partial,
        )

        return Response(PostReadSerializer(post).data)

    def delete(self, request, pk):
        PostService().delete(request.user, pk)
        return Response(status=status.HTTP_204_NO_CONTENT)


class WorkspacePostsView(APIView):
    authentication_classes = [BearerTokenAuthentication]

    permission_classes = [
        permissions.IsAuthenticated,
        CanCreatePosts,
    ]

    def get(self, request):
        return paginated_posts(
            PostService().workspace_list(request.user),
            request,
            self,
        )


class WorkspacePostDetailView(APIView):
    authentication_classes = [BearerTokenAuthentication]

    permission_classes = [
        permissions.IsAuthenticated,
        CanCreatePosts,
    ]

    def get(self, request, pk):
        post = PostService().workspace_detail(request.user, pk)
        return Response(PostReadSerializer(post).data)