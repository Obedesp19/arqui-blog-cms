from django.urls import path
from CampusForum_API.views.users import Userme
from CampusForum_API.views.dashboard import DashboardView
from CampusForum_API.views.auth import CustomAuthToken
urlpatterns = [path("me/", Userme.as_view()), path("dashboard/", DashboardView.as_view()), path("token/", CustomAuthToken.as_view())]
