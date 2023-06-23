from django.urls import *
from . import views
from django.conf import settings
from django.conf.urls.static import static
from baton.autodiscover import admin
from chat.routing import websocket_urlpatterns
urlpatterns = [
    path('', views.post_list, name='post_list'),
    path('formulario', views.formulario, name='formulario'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('suporte', views.suporte, name='suporte'),
    path('ckeditor/', include('ckeditor_uploader.urls')),
    path('baton/', include('baton.urls')),
    path('admin/', admin.site.urls),
    path('post/<int:pk>/', views.post_detail, name='post_detail'),
    path('chat', views.chat, name='chat'),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 