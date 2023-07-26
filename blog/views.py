# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from .models import *
import pandas as pd
import json 
import traceback
from django.contrib.auth.models import User
from .forms import post_form
from django.contrib import admin
from django.contrib.auth.views import LoginView
from django.contrib.auth import views as auth_views
from django.shortcuts import *
from django.db.models import F
from django.http import JsonResponse

import uuid

def post_list(request):

    posts = Post.objects.filter(published_date__lte=timezone.now()).order_by('-published_date')

    return render(request, 'blog/post_list.html', {'posts' : posts})

    
def suporte(request):
    return render(request, 'blog/suporte.html')

def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk)
    return render(request, 'blog/post_detail.html', {'post': post})


@login_required(login_url='admin/login')
def chat(request, conversa=None):
    context = {}
    if conversa:
        conversa_id = conversa
        if not Chat.objects.filter(id=conversa_id, participants=request.user).exists():
            return JsonResponse({'error': 'Acesso negado'})

        context['conversa'] = "teste " + conversa

        conversa_selec = Chat.objects.get(id=conversa_id)
        context['group_name'] = conversa_selec.group_name
        context['participantes'] = conversa_selec.participants.all()
        # context['conversa'] = conversa_selec.group_name
        # context['mensagens'] = conversa_selec.message

    

    context['users'] = User.objects.all()
    context['user_logged'] = {'user':request.user.id, 'chat': conversa}
    context['grupos'] = Chat.objects.filter(participants=request.user.id).values('group_name', 'chat_logo', 'id')
    context['conversa_id'] = Chat.objects.filter(participants=request.user.id).values_list('id', flat=True).first()
    context['conversas'] = Chat.objects.filter(participants=request.user.id).values()
    context['conversa_selec'] = Chat.objects.filter(participants=request.user.id).values_list('group_name', flat=True).first()
    context['mensagens'] = Message.objects.filter(chat_id=conversa).values('message', 'user_id', 'user__username', 'chat_id', 'created_date', 'archive')
    context['logo'] = Chat.objects.filter(id=conversa).values_list('chat_logo', flat=True).first()
    # print(context['user_logged'])
    # context['data'] = Message.objects.filter(chat_id=conversa).values('created_date')
    # print(context['data'])

    return render(request, 'blog/chat.html', context) 


def salvar_mensagem(request):
    try:
        if request.method == 'POST':
            mensagem = request.POST.get('message')
            user = request.POST.get('user')
            chat = request.POST.get('chat')
            type_message = request.POST.get('message_type')
            archive = request.FILES.get('archive')

            Message.objects.create(
                message=mensagem,
                user_id=user,
                chat_id=chat,
                message_type=type_message,
                archive=archive
            )           

            return JsonResponse({'status': True}, status=200)

        return JsonResponse({'status': False}, status=400)
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({'status': False}, status=400)
