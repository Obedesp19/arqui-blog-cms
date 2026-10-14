from django.shortcuts import render
from django.db.models import *
from django.db import transaction
from CampusForum_API.serializers import *
from CampusForum_API.models import *
from rest_framework.authentication import BasicAuthentication, SessionAuthentication, TokenAuthentication
from rest_framework.generics import CreateAPIView, DestroyAPIView, UpdateAPIView
from rest_framework import permissions
from rest_framework import generics
from rest_framework import status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.reverse import reverse
from rest_framework import viewsets
from django.shortcuts import get_object_or_404
from django.core import serializers
from django.utils.html import strip_tags
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from datetime import datetime
from django.conf import settings
from django.template.loader import render_to_string
import string
import random
import json

class Userme(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        user = request.user
        roles = [group.name for group in user.groups.all()]

        profile = Profiles.objects.filter(user=user).first()
        if not profile:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'id': user.pk,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'roles': roles,
        })

class UsersView(generics.CreateAPIView):

    @transaction.atomic
    def post(self, request, *args, **kwargs):

        user_data = UserSerializer(data=request.data)
        if user_data.is_valid():
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
            email = request.data.get('email', '')
            password = request.data.get('password', '')
            role = request.data.get('role', 'estudiante').lower()

            if role not in ('estudiante', 'profesor'):
                role = 'estudiante'

            if not password:
                return Response({"message": "La contraseña es obligatoria."}, status=status.HTTP_400_BAD_REQUEST)

            existing_user = User.objects.filter(email=email).first()

            if existing_user:
                return Response({"message": "Username "+email+", is already taken"}, 400)

            user = User.objects.create( username = email,
                                        email = email,
                                        first_name = first_name,
                                        last_name = last_name,
                                        is_active = 1)

            user.save()
            user.set_password(password)
            user.save()

            group, created = Group.objects.get_or_create(name=role)
            group.user_set.add(user)
            user.save()

            #Create a profile for the user
            profile = Profiles.objects.create(user=user)
            profile.save()

            return Response({"profile_created_id": profile.id }, 201)

        return Response(user_data.errors, status=status.HTTP_400_BAD_REQUEST)
