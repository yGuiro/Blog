# -*- coding: utf-8 -*-
from django.db.models import Q
from sqlite3 import IntegrityError
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
from django.http import JsonResponse
from django.db.models import Max, Count, F
from django.core.serializers import serialize
from datetime import datetime
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

        chat = Chat.objects.get(id=conversa_id)
        mensagens = chat.message_set.filter(state='unread').exclude(user_id=request.user.id).order_by('-created_date')

        for mensagem in mensagens:
            mensagem.state = 'read'
            mensagem.user_read.add(request.user)
            mensagem.save()

        context['conversa'] = "teste " + conversa
        conversa_selec = Chat.objects.get(id=conversa_id)
        context['group_name'] = conversa_selec.group_name
        context['participantes'] = conversa_selec.participants.all()

    context['users'] = User.objects.all()
    context['user_logged'] = {'user': request.user.id, 'chat': conversa}
    context['grupos'] = Chat.objects.filter(participants=request.user.id).annotate(num_mensagens_nao_lidas=Count('message__id', filter=Q(message__state='unread'))).order_by('-message__created_date')
    context['conversa_id'] = Chat.objects.filter(participants=request.user.id).values_list('id', flat=True).first()

    grupos = Chat.objects.filter(participants=request.user.id).annotate(
        last_message_date=Max('message__created_date')
    )

    context['grupos'] = grupos


    context['users'] = User.objects.all()
    context['user_logged'] = {'user':request.user.id, 'chat': conversa}
    context['grupos'] = Chat.objects.filter(participants=request.user.id).values('group_name', 'chat_logo', 'id').order_by('-updated_date') 
    context['conversa_id'] = Chat.objects.filter(participants=request.user.id).values_list('id', flat=True).first()
    context['conversas'] = Chat.objects.filter(participants=request.user.id).values()
    context['conversa_selec'] = Chat.objects.filter(participants=request.user.id).values_list('group_name', flat=True).first()
    context['mensagens'] = Message.objects.filter(chat_id=conversa).values('message', 'user_id', 'user__username', 'chat_id', 'created_date', 'archive', 'state')
    context['logo'] = Chat.objects.filter(id=conversa).values_list('chat_logo', flat=True).first()
    mensagens_nao_lidas = Message.objects.filter(
        chat__participants=request.user,
        state='unread'
    ).exclude(user_id=request.user.id).values_list('chat_id', flat=True).distinct()
    context['conversas_nao_lidas'] = mensagens_nao_lidas
    # context = {
    #     'user': context['users'],  # O usuário específico da mensagem
    #     'user_logado': context['user_logged'],  # O usuário logado
    #     'is_user_logado': context['users'] == context['user_logged']  # Variável booleana que indica se é o usuário logado ou não
    # }


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

def criar_conversa(request):
    try:
        if request.method == 'POST':
            
            nome_conversa = request.POST.get('nome_conversa')
            chat_logo = request.FILES.get('chat_logo')
            manada = request.POST.getlist('states[]')

            novo_chat = Chat.objects.create(
                group_name=nome_conversa,
                chat_logo=chat_logo,
            )       

            # Adiciona os participantes à relação many-to-many usando o método set()
            for participante_id in manada:
                novo_chat.participants.add(participante_id)

            # Agora você pode salvar o objeto Chat no banco de dados
            novo_chat.save()
            return JsonResponse({'status': True}, status=200)

        return JsonResponse({'status': False}, status=400)
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({'status': False}, status=400)

def mensagem_lida(request, conversa=None):

    
    context = {}
    if conversa:
        conversa_id = conversa
        if not Chat.objects.filter(id=conversa_id, participants=request.user).exists():
            return JsonResponse({'error': 'Acesso negado'})

    if request.method == "POST":
        user_id = request.POST.get("user_id")

        chat = get_object_or_404(Chat, id=conversa_id)

        if chat.participants.filter(id=request.user.id).exists():
            last_message = chat.message_set.order_by('-created_date').first()

            if last_message:
                last_message.user_read.add(request.user)

                if set(chat.participants.all()) == set(last_message.user_read.all()):
                    last_message.state = "read"
                    last_message.save()

            return JsonResponse({"status": True}, status=200)

    return JsonResponse({"status": False}, status=400)

def obter_mensagens(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id)
        mensagens = Message.objects.filter(chat=chat).values('id', 'message', 'user_id', 'user__username', 'created_date', 'archive', 'state')
        return JsonResponse(list(mensagens), safe=False)
    except Chat.DoesNotExist:
        return JsonResponse({'error': 'Conversa não encontrada'}, status=404)
    
def obter_conversas(request):
    # Consulte o banco de dados para obter as conversas atualizadas
    grupos = Chat.objects.all()  # Supondo que você tenha um modelo chamado Grupo que representa as conversas

    # Crie uma lista para armazenar os dados das conversas
    conversas = []
    for grupo in grupos:
        # Adicione os dados relevantes de cada conversa à lista
        conversas.append({
            'id': grupo.id,
            'group_name': grupo.group_name,
            'chat_logo': grupo.chat_logo.url,  # Supondo que chat_logo seja um campo FileField ou ImageField
            # Adicione outros campos relevantes, se necessário
        })
    
    mensagens = Message.objects.filter(chat_id=chat_id)
    formatted_messages = []
    for mensagem in mensagens:
        formatted_message = serialize('json', [mensagem])
        formatted_message = json.loads(formatted_message)[0]
        formatted_message['fields']['created_date'] = mensagem.created_date.strftime('%d/%m/%Y %H:%M')
        formatted_messages.append(formatted_message)

    # Retorne os dados como JSON
    return JsonResponse(conversas, safe=False)
