# -*- coding: utf-8 -*-
import json 
import requests
import traceback
import urllib.request
from .models import *
from blog.models import *
from django.core.mail import *
from django.db.models import Q
from django.utils import timezone
from newsapi import NewsApiClient
from django.http import JsonResponse
from django.db.models import Max, Count, F
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.core.serializers import serialize
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, get_object_or_404, redirect


def post_list(request):

    context = {}

    posts = Post.objects.filter(published_date__lte=timezone.now()).order_by('-published_date').values('author_post__first_name', 'author_post__last_name', 'author_post__username', 'author_post__email', 'author_post__id', 'summary', 'image', 'title', 'text', 'created_date', 'published_date', 'id', 'assunto')
    
    context['posts'] = posts

    if request.user.is_authenticated:
        unread_messages = Message.objects.filter(
            chat__participants=request.user, 
            state='unread'
        ).exclude(user=request.user)
        context['unread_messages'] = unread_messages.count()
    # print(context['unread_messages'])
    return render(request, 'blog/post_list.html', context)

def suporte(request):
    return render(request, 'blog/suporte.html')

@login_required(login_url='/accounts/login/')
def post_detail(request, post_id, assunto=None):
    try:
        post = get_object_or_404(Post, id=post_id, published_date__lte=timezone.now())
        
        apikey = "7e35c628d0e0377d70c8fdb628deade4"
        assunto = post.assunto
        url = f"https://gnews.io/api/v4/search?q={assunto}&lang=pt&country=br&max=3&apikey={apikey}"

        response = requests.get(url)
        
        news_articles = []
        if response.status_code == 200:
            news_articles = response.json().get('articles', [])

        context = {
            'post': post,
            'news': news_articles,
        }

        return render(request, 'blog/post_detail.html', context)
    except Post.DoesNotExist:
        return JsonResponse({'error': 'Post não encontrado'}, status=404)
    except requests.exceptions.RequestException:
        context = {
            'post': post,
            'news': [],  # ou deixe vazio se preferir
            'api_error': True,
        }
        return render(request, 'blog/post_detail.html', context)

@login_required(login_url='/accounts/login/')
def chat(request, conversa=None):
    context = {}
    chat = None

    if conversa:
        conversa_id = conversa
        chat = Chat.objects.filter(id=conversa_id, participants=request.user).first()

        if chat is None:
            return JsonResponse({'error': 'Acesso negado'})

        mensagens = Message.objects.filter(
            chat=chat,
            state='unread'
        ).exclude(user=request.user).order_by('-created_date')

        for mensagem in mensagens:
            mensagem.state = 'read'
            mensagem.user_read.add(request.user)
            mensagem.save()

        context['conversa'] = "teste " + conversa
        context['group_name'] = chat.group_name
        context['participantes'] = chat.participants.all()
    
    if chat:
        context['chat_image'] = chat.chat_logo

    context['chats'] = Chat.objects.order_by(F('updated_date').desc())
    context['users'] = User.objects.all()
    context['user_logged'] = {'user': request.user.id, 'chat': conversa}
    context['conversa_id'] = Chat.objects.filter(participants=request.user.id).values_list('id', flat=True).first()

    grupos = Chat.objects.filter(participants=request.user.id).annotate(
        last_message_date=Max('message__created_date')
    ).order_by('-updated_date')

    context['grupos'] = grupos
    context['conversas'] = Chat.objects.filter(participants=request.user.id).values()

    context['conversa_selec'] = chat.group_name if chat else None

    if chat is not None:
        context['editChat'] = chat.participants.all()

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
            owner = request.POST.get('user')
            print(owner)

            novo_chat = Chat.objects.create(
                group_name=nome_conversa,
                chat_logo=chat_logo,
                owner_id=owner
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
        mensagens = Message.objects.filter(chat=chat).values('id', 'message', 'user_id', 'user__username', 'created_date', 'archive', 'state', 'user__first_name', 'user__last_name')
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

def abrir_chamado(request):
    
    try:
        if request.method == "POST":
            remetente = request.POST.get("remetente")
            assunto = request.POST.get("assunto")
            mensagem = request.POST.get("mensagem_corpo")
            anexo = request.FILES.get("anexo") 
            userName = ["suporte@promoclick.digital"]

            try:
                mail = EmailMessage(assunto, mensagem, remetente, userName)
                if anexo:
                    mail.attach(anexo)
                mail.send()
                print("Email enviado com sucesso!")
                return JsonResponse({"message": "E-mail enviado com sucesso."})
            except Exception as e:
                print("Falha ao enviar email!")
                print(e)
        return JsonResponse({"message": "E-mail enviado com sucesso."})
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({'status': False}, status=400)

def newMessages(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id)
        mensagens = Message.objects.filter(chat=chat).values('id', 'message', 'user_id', 'user__username', 'created_date', 'archive', 'state')
        return JsonResponse(list(mensagens), safe=False)
    except Chat.DoesNotExist:
        return JsonResponse({'error': 'Conversa não encontrada'}, status=404)

    return render(request, 'blog/chat.html', context)

def editar_conversa(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id)
        owner_name = chat.owner.first_name + " " + chat.owner.last_name
        print(owner_name)
        context = {
            'owner_name': owner_name,
        }
        print(context)
        if request.user != chat.owner:
            return JsonResponse({'status': False, 'error': 'Você não tem permissão para editar esta conversa.'}, status=403)
        if request.user.id == chat.owner_id:
            if request.method == 'POST':
                
                participantes_ids = request.POST.getlist('states[]')
                if participantes_ids:
                    chat.participants.set(participantes_ids)
                
                group_image = request.FILES.get('group_image')
                if group_image:
                    chat.chat_logo = group_image
                
                group_name = request.POST.get('group_name')
                if group_name:
                    chat.group_name = group_name
                
                chat.save()
                
                # return render(request, 'blog/chat.html', context)
                return JsonResponse({'status': True, 'context': context})
            else:
                return JsonResponse({'status': False, 'error': 'Método inválido'}, status=400)
        else:
            print("Não é o dono")
    except Chat.DoesNotExist:
        return JsonResponse({'status': False, 'error': 'Conversa não encontrada'}, status=404)
    except User.DoesNotExist:
        return JsonResponse({'status': False, 'error': 'Usuário não encontrado'}, status=404)
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({'status': False, 'error': 'Ocorreu um erro inesperado'}, status=500)

def excluir_conversa(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id)
        if request.user != chat.owner:
            return JsonResponse({'status': False, 'error': 'Você não tem permissão para excluir esta conversa.'}, status=403)
        if request.user.id == chat.owner_id:
            chat.delete()
            return JsonResponse({'status': True})
        else:
            return JsonResponse({'status': False, 'error': 'Você não tem permissão para excluir esta conversa.'}, status=403)
    except Chat.DoesNotExist:
        return JsonResponse({'status': False, 'error': 'Conversa não encontrada'}, status=404)
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({'status': False, 'error': 'Ocorreu um erro inesperado'}, status=500)

@login_required(login_url='/accounts/login/')
def chatWS(request, chat_id=None, conversa=None):
    context = {}
    chat = None

    context['user_logged'] = request.user.id
    
    if chat_id:
        chat = Chat.objects.filter(id=chat_id, participants=request.user).first()
        if chat:
            # print(f"Chat ID: {chat.id}")
            # print(chat)
            context['chat_image'] = chat.chat_logo
            if chat.group_name:
                context['group_name'] = chat.group_name
            else:
                print("group_name is empty for chat with id " + str(chat.id))
        else:
            print("Chat is None") 
        context['chats'] = Chat.objects.order_by(F('updated_date').desc())
        context['users'] = User.objects.all()
        context['conversa_id'] = Chat.objects.filter(participants=request.user.id).values_list('id', flat=True).first()

    grupos = Chat.objects.filter(participants=request.user.id).annotate(
        last_message_date=Max('message__created_date')
    ).order_by('-updated_date')

    if chat is None:
        # Redireciona para chat_home se chat for None
        return chat_home(request)
        
    if conversa:
        conversa_id = conversa
        chat = Chat.objects.filter(id=conversa_id, participants=request.user).first()
    context['participantes'] = chat.participants.all()
    for grupo in grupos:
        grupo.lastMessage = Message.objects.filter(chat_id=grupo.id).values('message', 'user_id', 'user__username', 'created_date', 'archive', 'state', 'user__first_name', 'user__last_name').order_by('-created_date').first()
        grupo.last_sender = Message.objects.filter(chat_id=grupo.id).order_by('-created_date').first()
        if grupo.last_sender is not None:
            grupo.last_sender_name = grupo.last_sender.user.first_name + " " + grupo.last_sender.user.last_name
        # print(f"Grupo ID: {grupo.id}, Last Message: {grupo.lastMessage}, Last Sender: {grupo.last_sender}")
    
    context['grupos'] = grupos
    context['conversas'] = Chat.objects.filter(participants=request.user.id).values()
    context['conversa_selec'] = chat.group_name if chat else None


    if chat is not None:
        context['editChat'] = chat.participants.all()
    
    context['last_sender'] = Message.objects.filter(chat_id=chat_id).order_by('-created_date').first()
    print(context['last_sender'])
    
    return render(request, 'blog/teste.html', context)

@login_required(login_url='/accounts/login/')
def chat_home (request, chat_id=None, conversa=None):
    context = {}
    chat = None

    context['user_logged'] = request.user.id
    
    grupos = Chat.objects.filter(participants=request.user.id).annotate(
        last_message_date=Max('message__created_date')
    ).order_by('-updated_date')
    
        
    if conversa:
        conversa_id = conversa
        chat = Chat.objects.filter(id=conversa_id, participants=request.user).first()
    
    for grupo in grupos:
        grupo.lastMessage = Message.objects.filter(chat_id=grupo.id).values('message', 'user_id', 'user__username', 'created_date', 'archive', 'state', 'user__first_name', 'user__last_name').order_by('-created_date').first()
        grupo.last_sender = Message.objects.filter(chat_id=grupo.id).order_by('-created_date').first()
        if grupo.last_sender is not None:
            grupo.last_sender_name = grupo.last_sender.user.first_name + " " + grupo.last_sender.user.last_name
        print(f"Grupo ID: {grupo.id}, Last Message: {grupo.lastMessage}, Last Sender: {grupo.last_sender}")
    
    context['grupos'] = grupos
    context['conversas'] = Chat.objects.filter(participants=request.user.id).values()
    context['conversa_selec'] = chat.group_name if chat else None


    if chat is not None:
        context['editChat'] = chat.participants.all()
    
    context['last_sender'] = Message.objects.filter(chat_id=chat_id).order_by('-created_date').first()
    print(context['last_sender'])
    
    return render(request, 'blog/chat_home.html', context)