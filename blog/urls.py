from django.urls import *
from . import views
from django.conf import settings
from django.conf.urls.static import static
from baton.autodiscover import admin
from chat.routing import websocket_urlpatterns
from django.contrib import admin
from django.contrib.auth.views import LoginView
from django.contrib import admin

urlpatterns = [
    path('', views.post_list, name='post_list'),  
    path('accounts/', include('django.contrib.auth.urls')),
    path('suporte', views.suporte, name='suporte'),
    path('ckeditor/', include('ckeditor_uploader.urls')),
    path('baton/', include('baton.urls')),
    path('post/<int:pk>/', views.post_detail, name='post_detail'),
    path('chat', views.chat, name='chat'),
    path('chat/<str:conversa>', views.chat, name='chat'),
    path('salvar_mensagem/', views.salvar_mensagem, name='salvar_mensagem'),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 