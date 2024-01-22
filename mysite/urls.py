from django.contrib import admin
from django.urls import path, include, re_path
from .routing import websocket_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('blog.urls')),
    re_path(r'^ws/', include(websocket_urlpatterns))
]