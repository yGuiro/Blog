# Generated by Django 4.2.1 on 2023-07-19 09:09

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('blog', '0029_alter_chat_type_chat'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='user_read',
            field=models.ManyToManyField(related_name='user_read', to=settings.AUTH_USER_MODEL),
        ),
    ]
