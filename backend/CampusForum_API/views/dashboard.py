from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from CampusForum_API.models import BearerTokenAuthentication
from CampusForum_API.services.dashboard_service import DashboardService


class DashboardView(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(DashboardService().overview(request.user))
