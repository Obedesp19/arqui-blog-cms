from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from CampusForum_API.editorial_serializers import (
    EditorialActionSerializer,
)
from CampusForum_API.models import BearerTokenAuthentication
from CampusForum_API.permissions import CanCreatePosts
from CampusForum_API.post_serializers import PostReadSerializer
from CampusForum_API.services.editorial_service import EditorialService


class PostEditorialActionView(APIView):
    authentication_classes = [
        BearerTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
        CanCreatePosts,
    ]

    def post(self, request, pk):
        serializer = EditorialActionSerializer(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)

        post = EditorialService().transition(
            request.user,
            pk,
            serializer.validated_data["action"],
        )

        return Response(
            PostReadSerializer(post).data,
        )