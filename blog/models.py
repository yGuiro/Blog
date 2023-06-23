from django.conf import settings
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User, AbstractBaseUser
from ckeditor.fields import RichTextField
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from django.utils.timezone import localtime
from model_utils.models import TimeStampedModel, SoftDeletableModel, SoftDeletableManager
from typing import Optional, Any
import uuid

User = get_user_model()

# Create your models here.


class Post(models.Model):
    author_post = models.ForeignKey(User, default=None, on_delete=models.CASCADE, verbose_name='Autor')
    summary = models.TextField(verbose_name='Resumo')
    image = models.ImageField(upload_to='media/', null=True, verbose_name='Imagem')
    title = models.CharField(max_length=200, verbose_name='Título')
    text = RichTextField( null=True, verbose_name='Texto')
    created_date = models.DateTimeField(default=timezone.now, verbose_name='Data de criação')
    published_date = models.DateTimeField(default=timezone.now, null=True, verbose_name='Data de publicação')

    def publish(self):
        self.published_date = timezone.now()
        self.save()

    def __str_(self):
        return self.title


    class Meta:
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
        db_table = 'blog_post'


