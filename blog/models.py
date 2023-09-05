from django.conf import settings
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from ckeditor.fields import RichTextField
from django.db.models.signals import post_save
from django.dispatch import receiver
from typing import Optional, Any
from django.utils.translation import gettext_lazy as _
from model_utils.models import TimeStampedModel, SoftDeletableModel, SoftDeletableManager
from django.contrib.auth.models import *
User = get_user_model()

class Post(models.Model):
    author_post = models.ForeignKey(User, default=None, on_delete=models.CASCADE, verbose_name='Autor')
    assunto = models.CharField(max_length=200, verbose_name='Categoria')
    summary = models.TextField(verbose_name='Resumo')
    image = models.ImageField(upload_to='media/', null=True, verbose_name='Imagem')
    title = models.CharField(max_length=200, verbose_name='Título')
    text = RichTextField(null=True, verbose_name='Texto')
    created_date = models.DateTimeField(default=timezone.now, verbose_name='Data de criação')
    published_date = models.DateTimeField(default=timezone.now, null=True, verbose_name='Data de publicação')

    def publish(self):
        self.published_date = timezone.now()
        self.save()

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
        db_table = 'blog_post'

class Chat(models.Model):
    participants = models.ManyToManyField(User, related_name='chats', verbose_name='Participantes')
    type_chat = models.CharField(default='chat', choices=(('chat','chat'), ('group', 'group')), max_length=200, verbose_name='Tipo de chat')
    chat_logo = models.ImageField(upload_to='media/logo/', null=True, verbose_name='Imagem')
    group_name = models.CharField(max_length=200, verbose_name='Nome do grupo')
    created_date = models.DateTimeField(default=timezone.now, verbose_name='Data de criação')
    updated_date = models.DateTimeField(auto_now=True, verbose_name='Data de atualização')

    def get_last_message_date(self):
        last_message = self.get_last_message()
        if last_message:
            return last_message.updated_date
        return None

class Message(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='Usuário')
    chat = models.ForeignKey('Chat', on_delete=models.CASCADE, verbose_name='Chat')
    message = models.CharField(max_length=1024, verbose_name='Mensagem')
    state = models.CharField(max_length=200, verbose_name='Estado', default='unread', choices=(('unread', 'Não lido'), ('read', 'Lido')))
    user_read = models.ManyToManyField(User, related_name='user_read')
    message_type = models.CharField(max_length=200, verbose_name='Tipo de mensagem', default='text', choices=(
        ('text', 'Texto'), ('image', 'Imagem'), ('video', 'Vídeo'), ('audio', 'Áudio'), ('document', 'Documento'),
        ('archive', 'Arquivo')))
    archive = models.FileField(upload_to='uploads/', null=True, verbose_name='Arquivo')
    updated_date = models.DateTimeField(auto_now=True, verbose_name='Data de atualização')
    created_date = models.DateTimeField(auto_now_add=True, verbose_name='Data de criação')

    class Meta:
        verbose_name = 'Mensagem'
        verbose_name_plural = 'Mensagens'

    def __str__(self):
        return f'Mensagem por {self.user} em {self.created_date}'

@receiver(post_save, sender=Message)
def update_chat_updated_date(sender, instance, **kwargs):
    instance.chat.updated_date = timezone.now()
    instance.chat.save()
