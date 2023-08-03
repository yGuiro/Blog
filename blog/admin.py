from django.contrib import admin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.contrib.auth.admin import UserAdmin
from .models import *

# Register your models here.
from .models import Post

class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author_post', 'created_date', 'published_date')
    list_filter = ('created_date', 'published_date', 'author_post')
    search_fields = ('title', 'text')

    def get_changeform_initial_data(self, request):
        return {'author_post': request.user}
    


admin.site.register(Post, PostAdmin)

class ChatAdmin(admin.ModelAdmin):
    list_display = ('group_name', 'type_chat', 'created_date', 'updated_date')
    list_filter = ('created_date', 'updated_date', 'type_chat')
    search_fields = ('group_name', 'participants')
    filter_horizontal = ('participants',)

admin.site.register(Chat, ChatAdmin)

class MessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'chat_id','message', 'state', 'message_type', 'created_date')
    list_filter = ('message',)
    search_fields = ('message',)

admin.site.register(Message, MessageAdmin)


admin.site.site_header = 'Blog da Promova'


