from rest_framework import generics
from CampusForum_API.models import Post
from CampusForum_API.serializers import PostSerializer

class PostsView(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by('-creation')
    serializer_class = PostSerializer


class PostDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Post.objects.all()
    serializer_class = PostSerializer