from django.db import migrations, models


def convert_hidden_to_archived(apps, schema_editor):
    Post = apps.get_model("CampusForum_API", "Post")
    database = schema_editor.connection.alias

    Post.objects.using(database).filter(
        estado="OCULTO",
    ).update(
        estado="ARCHIVADO",
    )


def convert_archived_to_hidden(apps, schema_editor):
    Post = apps.get_model("CampusForum_API", "Post")
    database = schema_editor.connection.alias

    Post.objects.using(database).filter(
        estado="ARCHIVADO",
    ).update(
        estado="OCULTO",
    )

    Post.objects.using(database).filter(
        estado="PENDIENTE_REVISION",
    ).update(
        estado="BORRADOR",
    )


class Migration(migrations.Migration):
    dependencies = [
        (
            "CampusForum_API",
            "0007_category_description_status",
        ),
    ]

    operations = [
        migrations.RunPython(
            convert_hidden_to_archived,
            convert_archived_to_hidden,
        ),
        migrations.AlterField(
            model_name="post",
            name="estado",
            field=models.CharField(
                choices=[
                    ("BORRADOR", "Borrador"),
                    (
                        "PENDIENTE_REVISION",
                        "Pendiente de revisión",
                    ),
                    ("PUBLICADO", "Publicado"),
                    ("ARCHIVADO", "Archivado"),
                ],
                default="BORRADOR",
                max_length=20,
            ),
        ),
    ]