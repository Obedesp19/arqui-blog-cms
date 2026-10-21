from django.db.models import Count
from CampusForum_API.models import Category, Comment, Post


class DashboardRepository:
    def overview(self, editorial=False):
        posts = Post.objects.filter(estado="PUBLICADO")
        comments = Comment.objects.filter(estado="APROBADO", post__estado="PUBLICADO")
        categories = posts.values("categoria_id", "categoria__nombre").annotate(total=Count("id")).order_by("-total", "categoria_id")
        conversations = comments.values("post__categoria_id", "post__categoria__nombre").annotate(total=Count("id")).order_by("-total", "post__categoria_id")[:5]
        authors = posts.values("author_id", "author__first_name", "author__last_name").annotate(total=Count("id")).order_by("-total", "author_id")[:5]
        result = {
            "published_posts": posts.count(),
            "active_categories": Category.objects.filter(estado="ACTIVO").count(),
            "approved_comments": comments.count(),
            "posts_by_category": [
                {"id": row["categoria_id"], "nombre": row["categoria__nombre"] or "Sin categoría", "total": row["total"]}
                for row in categories
            ],
            "comments_by_category": [
                {"id": row["post__categoria_id"], "nombre": row["post__categoria__nombre"] or "Sin categoría", "total": row["total"]}
                for row in conversations
            ],
            "top_authors": [
                {"id": row["author_id"], "nombre": f'{row["author__first_name"]} {row["author__last_name"]}'.strip() or "Usuario", "total": row["total"]}
                for row in authors
            ],
            "editorial": None,
        }
        if editorial:
            result["editorial"] = {
                "pending_posts": Post.objects.filter(estado="PENDIENTE_REVISION").count(),
                "pending_comments": Comment.objects.filter(estado="PENDIENTE").count(),
            }
        return result
