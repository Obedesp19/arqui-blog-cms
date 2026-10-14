from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from CampusForum_API.auth_serializers import LoginSerializer
from CampusForum_API.models import BearerTokenAuthentication
from CampusForum_API.services.auth_service import AuthService


class CustomAuthToken(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(
            AuthService().login(
                request,
                serializer.validated_data,
            )
        )


class Logout(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        AuthService().logout(request.user)

        return Response({
            "logout": True,
        })