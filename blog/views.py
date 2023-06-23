# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.utils import timezone
from .models import Post
from django.contrib.auth.models import User
from .forms import post_form
from django import forms
from django.shortcuts import *



# Create your views here.

def post_list(request):

    posts = Post.objects.filter(published_date__lte=timezone.now()).order_by('-published_date')

    return render(request, 'blog/post_list.html', {'posts' : posts})


def formulario(request):
    try:
        if request.user.is_authenticated:
            if request.method == 'GET':
                return render(request, 'registration/formulario.html', {'form' : post_form})
        else:
            return redirect('login')
    except Exception as e:
        import traceback
        print(traceback.print_exc())
        return render(request, 'registration/formulario.html', {'form' : post_form})

def formulario_register(request):
    try:
        #use post and dispatch to handle post and get requests
        if request.method == 'POST':
            print(request.user)
            request.POST._mutable = True
            request.POST['author_post'] = request.user.id
            request.POST._mutable = False
            # print(request.POST)
            form = post_form(request.POST) 
            if form.is_valid():
                form.save_new()
                return redirect('post_list') 
            else:
                print(form.errors)
                return render(request, 'registration/formulario.html', {'form' : post_form})
    except Exception as e:
        import traceback
        print(e)
        return render(request, 'registration/formulario.html', {'form' : post_form})
    
def suporte(request):
    return render(request, 'blog/suporte.html')

def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk)
    return render(request, 'blog/post_detail.html', {'post': post})

def chat(request):
    return render(request, 'blog/chat.html', {'users': User.objects.all()})

