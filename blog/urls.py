from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views

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
    path('criar_conversa/', views.criar_conversa, name='criar_conversa'),
    path('mensagem_lida/<str:conversa>/', views.mensagem_lida, name='mensagem_lida'),
    path('obter_mensagens/<int:chat_id>/', views.obter_mensagens, name='obter_mensagens'),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 
