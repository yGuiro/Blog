from .models import *
from django import forms

class post_form(forms.ModelForm):

    '''
    Formulario de cadastro de empresa, dados Basicos
    '''
    class Meta:
        model = Post
        fields = ('title', 'text', 'author_post')
        #set complemento as not required field
        required = {
            'title': True,
            'text': True,
        }
        
        # labels
        labels = {
            'title': 'Título',
            'text': 'Conteúdo',
        }

        # add n form control as all fields
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'text': forms.Textarea(attrs={'class': 'form-control'}),
        }

    def save_new(self, commit=True):
        print(self.changed_data)
        empresa = super(post_form, self).save(commit=False)
        if commit:
            empresa.save()
        return empresa
    
    def update_empresa(self, data, commit=True):
        try:
            #valida querydict e atualiza dados da empresa no banco de dados usando o id_update_id como chave de busca
            emp = Post.objects.get(id=data['id_update_id'])
            
            if data['cnpj']:
                emp.cnpj = data['cnpj']
            if data['nome']:
                emp.nome = data['nome']
            if data['razaosocial']:
                emp.razaosocial = data['razaosocial']
            if data['telefone']:
                emp.telefone = data['telefone']
            if data['cep']:
                emp.cep = data['cep']
            if data['status']:
                emp.status = data['status']
            if data['tipo_empresa']:
                emp.tipo_empresa = data['tipo_empresa']
            if data['logradouro']:
                emp.logradouro = data['logradouro']
            if data['numero']:
                emp.numero = data['numero']
            if data['bairro']:
                emp.bairro = data['bairro']
            if data['cidade']:
                emp.cidade = data['cidade']
            if data['estado']:
                emp.estado = data['estado']
            if data['complemento']:
                emp.complemento = data['complemento']
            if commit:
                emp.save()
            return True
        except:
            return False
