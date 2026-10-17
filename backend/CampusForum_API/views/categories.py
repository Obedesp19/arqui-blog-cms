from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from CampusForum_API.category_serializers import CategoryReadSerializer
from CampusForum_API.models import BearerTokenAuthentication
from CampusForum_API.permissions import IsEditorOrAdministrator
from CampusForum_API.services.category_service import CategoryService


class CategoryPagination(PageNumberPagination):
    page_size = 20


def category_page(request, view, queryset):
    paginator = CategoryPagination()
    page = paginator.paginate_queryset(
        queryset,
        request,
        view=view,
    )

    return paginator.get_paginated_response(
        CategoryReadSerializer(page, many=True).data
    )


class CategoriesView(APIView):
    authentication_classes = [BearerTokenAuthentication]

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [AllowAny()]

        return [IsEditorOrAdministrator()]

    def get(self, request):
        categories = CategoryService().public_list()
        return category_page(request, self, categories)

    def post(self, request):
        category = CategoryService().create(
            request.user,
            request.data,
        )

        return Response(
            CategoryReadSerializer(category).data,
            status=status.HTTP_201_CREATED,
        )


class CategoryDetailView(APIView):
    authentication_classes = [BearerTokenAuthentication]

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [AllowAny()]

        return [IsEditorOrAdministrator()]

    def get(self, request, pk):
        category = CategoryService().public_detail(pk)

        return Response(
            CategoryReadSerializer(category).data
        )

    def patch(self, request, pk):
        category = CategoryService().update(
            request.user,
            pk,
            request.data,
        )

        return Response(
            CategoryReadSerializer(category).data
        )


class WorkspaceCategoriesView(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsEditorOrAdministrator]

    def get(self, request):
        categories = CategoryService().workspace_list(
            request.user,
        )

        return category_page(request, self, categories)


class WorkspaceCategoryDetailView(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsEditorOrAdministrator]

    def get(self, request, pk):
        category = CategoryService().workspace_detail(
            request.user,
            pk,
        )

        return Response(
            CategoryReadSerializer(category).data
        )