from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from CampusForum_API.auth_serializers import RegistrationSerializer
from CampusForum_API.models import BearerTokenAuthentication
from CampusForum_API.services.auth_service import AuthService


class UsersView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = AuthService().register(serializer.validated_data)

        return Response(
            result,
            status=status.HTTP_201_CREATED,
        )


class Userme(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            AuthService().current_user(request.user)
        )