"""point_experts_api URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from CampusForum_API.views import bootstrap
from CampusForum_API.views import users
from CampusForum_API.views import auth
from CampusForum_API.views import posts
from CampusForum_API.views import categories
from CampusForum_API.views import user_admin
from CampusForum_API.views.posts import (
    WorkspacePostsView,
    WorkspacePostDetailView,
)

urlpatterns = [
    #Version
        path('bootstrap/version', bootstrap.VersionView.as_view()),
    #Create User
        path('users/', users.UsersView.as_view()),
    #User Data
        path('me/', users.Userme.as_view()),
    #Login
        path('token/', auth.CustomAuthToken.as_view()),
    #Logout
        path('logout/', auth.Logout.as_view()),
    #Posts
        path('posts/', posts.PostsView.as_view()),
        path('posts/<int:pk>/', posts.PostDetailView.as_view()),
    #Workspace Posts
    path(
    "workspace/posts/",
    WorkspacePostsView.as_view(),
    name="workspace-posts",
    ),
    path(
    "workspace/posts/<int:pk>/",
    WorkspacePostDetailView.as_view(),
    name="workspace-post-detail",
    ),
    #Admin Users
        path('admin/users/', user_admin.AdminUsersView.as_view()),
        path('admin/users/<int:pk>/', user_admin.AdminUserDetailView.as_view(),),
    # Categories
    path(
        "categories/",
        categories.CategoriesView.as_view(),
        name="categories",
    ),
    path(
        "categories/<int:pk>/",
        categories.CategoryDetailView.as_view(),
        name="category-detail",
    ),

    # Workspace categories
    path(
        "workspace/categories/",
        categories.WorkspaceCategoriesView.as_view(),
        name="workspace-categories",
    ),
    path(
        "workspace/categories/<int:pk>/",
        categories.WorkspaceCategoryDetailView.as_view(),
        name="workspace-category-detail",
    ),
]

