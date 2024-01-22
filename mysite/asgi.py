from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from django.urls import path
import os
from mysite.routing import websocket_urlpatterns
from mysite.consumers import MyConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            [path("ws/chat/<str:chat_id>/", MyConsumer.as_asgi())] + websocket_urlpatterns
        )
    ),
})
