import json
import base64
from blog.models import *
from django.db.models import Count, F
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from django.db.models.fields.files import ImageFieldFile
from channels.generic.websocket import AsyncWebsocketConsumer

class MyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']  # Extract chat_id from the URL route
        self.room_group_name = 'chat_%s' % self.chat_id  # Use chat_id to create unique group name
        await self.accept()
        await self.check_all_unread_messages()

        group_name = await self.get_group_name(self.chat_id)
        participants = await self.get_participants_names(self.chat_id)
        chat_logo = await self.get_chat_logo(self.chat_id)
        history = await self.get_chat_history(self.chat_id)  # Use await directly
        get_last_message = await self.get_chat_history(self.chat_id)
        await self.send(text_data=json.dumps({
                'type': 'chat_history',
                'history': history,
                'get_last_message': get_last_message,
                'chat_id': self.chat_id,
                'group_name': group_name,
                'participants': participants,
                'chat_logo': chat_logo,
            }))
        # print(f"Enviado para o WebSocket: {history}")

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

    async def disconnect(self, close_code):
        # Leave chat group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        self.room_group_name = None
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')

        if message_type == 'new_message':
            message = text_data_json.get('message')
            user_id = text_data_json.get('user_id')
            chat_id = text_data_json.get('chat_id')
            created_date = text_data_json.get('created_date')
            first_name, last_name = await self.get_user_name(user_id)
            
            history = await self.get_chat_history(chat_id)
            state = history[-1]['state'] if history else None
            
            # Send message to chat group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': user_id,
                    'first_name': first_name,
                    'last_name': last_name,
                    'chat_id': chat_id,
                    'created_date': created_date,
                    'state': state,
                }
            )
            
        elif message_type == 'chat_update':
            # Process chat update
            user_id = text_data_json.get('user_id')
            update = text_data_json.get('update')
            await self.send_chat_update({
                'type': 'chat_update',
                'update': update,
                'sender': user_id
            })

        elif message_type == 'change_chat':
            # Process change chat
            user_id = text_data_json.get('user_id')
            new_chat_id = text_data_json.get('newChatId')
            group_name = await self.get_group_name(new_chat_id)
            participants = await self.get_participants_names(new_chat_id)
            chat_logo = await self.get_chat_logo(new_chat_id)
            await self.change_chat({
                'type': 'change_chat',
                'newChatId': new_chat_id,
                'sender': user_id,
                'group_name': group_name,
                'participants': participants,
                'chat_logo': chat_logo,
            })
            
        elif message_type == 'file_upload':
            user_id = text_data_json.get('user_id')
            file_data = text_data_json.get('file_data')

            if file_data is not None:
                await self.process_file_upload(user_id, file_name, file_data)
            else:
                print("file_data not found in message")
                return

    @database_sync_to_async
    def save_message(self, user_id, chat_id, message):
        user = User.objects.get(id=user_id)
        chat = Chat.objects.get(id=int(chat_id))
        message_obj = Message.objects.create(user=user, chat=chat, message=message)

        # Salvar a entrada para o usuário que enviou a mensagem
        message_obj.user_read.add(user)

        # Salvar a entrada para todos os outros usuários no chat
        for participant in chat.participants.all():
            if participant != user:
                message_obj.user_read.add(participant)

        return message_obj

    async def chat_message(self, event):
        await self.check_all_unread_messages()
        message = event.get('message')
        if message is not None:    
            if event['message'] is not None:
                await self.save_message(event['sender'], self.chat_id, event['message'])
                await self.check_if_all_users_have_seen_message(message)

                # Send message to WebSocket
                await self.send(text_data=json.dumps({
                    'type': 'chat_message',
                    'message': event['message'],
                    'sender': event['sender'],
                    'first_name': event['first_name'],
                    'last_name': event['last_name'],
                    'created_date': event['created_date'],
                    'state': event['state'],
                }))
                await self.send_last_message_info(event['chat_id'])

            else:
                print(f"A mensagem não pode ser nula. Evento recebido: {event}")

    @database_sync_to_async
    def check_if_all_users_have_seen_message(self, event):
        message_obj = None
        if isinstance(event, dict):
            message_obj = event.get('message')
        else:
            print("O evento não é um dicionário.")

        if message_obj:
            chat_users = message_obj.chat.participants.all()
            users_who_read = message_obj.user_read.all()

            # Verifique se todos os usuários do chat estão na tabela user_read
            if set(chat_users) == set(users_who_read):
                # Se todos os usuários do chat leram a mensagem, altere o estado para "read"
                message_obj.state = "read"
                message_obj.save()
        else:
            print("O objeto 'message' não está presente ou não é válido.")

    async def send_last_message_info(self, chat_id):
        last_message = await self.get_last_message_info(chat_id)
        await self.send(text_data=json.dumps({
            'type': 'last_message_info',
            'chat_id': chat_id,
            'last_sender_name': last_message['sender_name'],
            'last_message': last_message['message'],
        }))

    @database_sync_to_async
    def check_all_unread_messages(self):
        # Obtenha todas as mensagens não lidas
        unread_messages = Message.objects.filter(state="unread")

        for message_obj in unread_messages:
            chat_users = message_obj.chat.participants.all()
            users_who_read = message_obj.user_read.all()

            # Verifique se todos os usuários do chat estão na tabela user_read
            if set(chat_users) == set(users_who_read):
                # Se todos os usuários do chat leram a mensagem, altere o estado para "read"
                message_obj.state = "read"
                message_obj.save()
                
    @database_sync_to_async
    def get_chat_history(self, chat_id):
        # Fetch the last 50 messages from the chat
        messages = Message.objects.filter(chat_id=chat_id).order_by('-created_date')
        # Convert the messages to a format that can be sent over the WebSocket
        history = [{'user': message.user_id, 'first_name': message.user.first_name, 'last_name': message.user.last_name, 'message': message.message,'state': message.state,'date': message.created_date.isoformat(), 'sender': message.user_id} for message in messages]
        return history

    @database_sync_to_async
    def get_user_name(self, user_id):
        user = User.objects.get(id=user_id)
        return user.first_name, user.last_name

    @database_sync_to_async
    def get_last_message_info(self, chat_id):
        try:
            # Fetch only the last message
            last_message = Message.objects.filter(chat_id=chat_id).order_by('-created_date').first()

            if last_message:
                last_message_info = {
                    'sender_name': last_message.user.first_name,
                    'message': last_message.message
                }
                return last_message_info
            else:
                print(f"Nenhuma mensagem encontrada para chat_id {chat_id}")
                return {'sender_name': None, 'message': None}
            
        except Exception as e:
            print(f"Erro ao obter última mensagem: {e}")
            return {'sender_name': None, 'message': None}
    
    async def change_chat(self, event):
        new_chat_id = event['newChatId']
        sender = event['sender']
        group_name = event['group_name']
        participants = event['participants']
        chat_logo = event['chat_logo']
        
        # Leave the current chat group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Set the new chat_id and group name
        self.chat_id = new_chat_id
        self.room_group_name = f'chat_{new_chat_id}'

        # Join the new chat group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Send a message to all consumers in the new chat group
        await self.send_chat_update({
            'type': 'chat_changed',
            'sender': sender,
            'group_name': group_name,
            'participants': participants,
            'chat_logo': chat_logo,
        })

        # Fetch and send the chat history for the new chat
        history = await self.get_chat_history(self.chat_id)
        await self.send(text_data=json.dumps({
            'type': 'chat_history',
            'history': history,
            'chat_id': self.chat_id,
            'group_name': group_name,
            'participants': participants,
            'chat_logo': chat_logo,
        }))

    async def send_chat_update(self, event):
        sender = event['sender']
        group_name = event['group_name']
        participants = event['participants']
        chat_logo = event['chat_logo']
        
        # Send a message to all consumers in the chat group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_changed',
                'sender': sender,
                'group_name': group_name,
                'participants': participants,
                'chat_logo': chat_logo,
            }
        )

    async def chat_changed(self, event):
        # Send a message to the WebSocket to handle the chat change
        await self.send(text_data=json.dumps({
            'type': 'chat_changed',
            'sender': event['sender'],
            'group_name': event['group_name'],
            'participants': event['participants'],
            'chat_logo': event['chat_logo'],
        }))

    @database_sync_to_async
    def get_participants_names(self, participants):
        try:
            chat = Chat.objects.prefetch_related('participants').get(id=participants)
            participants_names = list(chat.participants.values_list('first_name', flat=True))
            return participants_names
        except Chat.DoesNotExist:
            print("Chat não encontrado")

    @database_sync_to_async
    def get_group_name(self, chat_id):
        return Chat.objects.get(id=chat_id).group_name
    
    @database_sync_to_async
    def get_chat_logo(self, chat_id):
        try:
            # Obtenha o logotipo do chat usando o chat_id
            chat_logo = Chat.objects.get(id=chat_id).chat_logo

            # Converta o caminho do logotipo para uma string
            return str(chat_logo) if chat_logo else None
        except Chat.DoesNotExist:
            print("Imagem não encontrada")
            return None
        

    async def process_file_upload(self, user_id, file_name, file_data):
        # Decodificar os dados do arquivo de base64
        file_data_decoded = base64.b64decode(file_data)

        # Salvar os dados do arquivo no diretório de upload
        upload_dir = os.path.join(settings.MEDIA_ROOT, settings.CKEDITOR_UPLOAD_PATH)
        file_path = os.path.join(upload_dir, file_name)
        
        # Verificar se o diretório de upload existe, se não, criar
        os.makedirs(upload_dir, exist_ok=True)

        with open(file_path, 'wb') as file:
            file.write(file_data_decoded)

        # Quando você terminar de processar o arquivo, você pode enviar uma mensagem
        # de volta para o cliente para informá-lo de que o upload do arquivo foi bem-sucedido.
        # await self.send(text_data=json.dumps({
        #     'type': 'file_upload_response',
        #     'status': 'success',
        #     'message': 'File uploaded successfully',
        # }))