# Generated by Django 4.2.1 on 2023-06-21 10:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0021_uploadedfile_messagemodel_dialogsmodel'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='messagemodel',
            name='file',
        ),
        migrations.RemoveField(
            model_name='messagemodel',
            name='recipient',
        ),
        migrations.RemoveField(
            model_name='messagemodel',
            name='sender',
        ),
        migrations.RemoveField(
            model_name='uploadedfile',
            name='uploaded_by',
        ),
        migrations.DeleteModel(
            name='DialogsModel',
        ),
        migrations.DeleteModel(
            name='MessageModel',
        ),
        migrations.DeleteModel(
            name='UploadedFile',
        ),
    ]
