from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from CampusForum_API.models import BearerTokenAuthentication
from CampusForum_API.permissions import IsCmsAdministrator
from CampusForum_API.services.user_admin_service import UserAdminService
from CampusForum_API.user_admin_serializers import (
    AdminUserSerializer,
    AdminUserUpdateSerializer,
)


class UserPagination(PageNumberPagination):
    page_size = 20


class AdminUsersView(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsCmsAdministrator]

    def get(self, request):
        users = UserAdminService().list_users(request.user)

        paginator = UserPagination()
        page = paginator.paginate_queryset(
            users,
            request,
            view=self,
        )

        return paginator.get_paginated_response(
            AdminUserSerializer(page, many=True).data
        )


class AdminUserDetailView(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsCmsAdministrator]

    def patch(self, request, pk):
        serializer = AdminUserUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = UserAdminService().update_user(
            request.user,
            pk,
            serializer.validated_data,
        )

        return Response(
            AdminUserSerializer(user).data
        )