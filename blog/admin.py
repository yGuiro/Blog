from django.contrib import admin
from .models import Post

# Register your models here.
from .models import Post

class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author_post', 'created_date', 'published_date')
    list_filter = ('created_date', 'published_date', 'author_post')
    search_fields = ('title', 'text')

    def get_changeform_initial_data(self, request):
        return {'author_post': request.user}
    


admin.site.register(Post, PostAdmin)


admin.site.site_header = 'Blog da Promova'
