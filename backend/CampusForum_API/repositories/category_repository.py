from CampusForum_API.models import Category


class CategoryRepository:
    def list_categories(self, include_inactive=False):
        queryset = Category.objects.all()

        if not include_inactive:
            queryset = queryset.filter(estado="ACTIVO")

        return queryset.order_by("nombre", "id")

    def get_category(self, pk, include_inactive=False):
        return (
            self.list_categories(include_inactive)
            .filter(pk=pk)
            .first()
        )

    def locked_category(self, pk):
        return (
            Category.objects
            .select_for_update()
            .filter(pk=pk)
            .first()
        )

    def name_exists(self, nombre, exclude_id=None):
        queryset = Category.objects.filter(
            nombre__iexact=nombre,
        )

        if exclude_id is not None:
            queryset = queryset.exclude(pk=exclude_id)

        return queryset.exists()

    def create(self, data):
        return Category.objects.create(**data)

    def update(self, category, data):
        for field, value in data.items():
            setattr(category, field, value)

        category.save()
        return category