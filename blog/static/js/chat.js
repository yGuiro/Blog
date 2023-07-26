// Parsing do conteúdo do elemento "user_logado" para obter informações do usuário logado
const userLogged = JSON.parse(document.getElementById("user_logado").textContent);

var file = null;

$(document).ready(function () {
  // Inicialização do plugin select2 para o elemento com a classe "js-example-basic-single"
  $(".js-example-basic-single").select2({
    dropdownParent: $("#novaconversamodal"),
  });


  //   $('.filename').each(function() {
  //     var filePath = $(this).prev('img').attr('src');
  //     var filename = filePath.substring(filePath.lastIndexOf('/') + 1);
  //     var extension = filename.split('.').pop().toLowerCase();
  //     var validExtensions = ['txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
      
  //     if (validExtensions.includes(extension)) {
  //         $(this).text(filename);
  //     } else {
  //         $(this).text('');
  //     }
  // });

  $('.filename').each(function() {
    var filePath = $(this).prev('img').attr('src');
    var filename = filePath.substring(filePath.lastIndexOf('/') + 1);
    var extension = filename.split('.').pop().toLowerCase();
    var iconClass = getIconClass(extension);
    $(this).html('<i class="' + iconClass + '"></i> ' + filename);
});

function getIconClass(extension) {
    var iconClass = '';
    
    switch (extension) {
        case 'pdf':
            iconClass = 'fa-solid fa-file-pdf fa-2xl';
            break;
        case 'doc':
        case 'docx':
            iconClass = 'fa-solid fa-file-word fa-2xl';
            break;
        case 'xls':
        case 'xlsx':
            iconClass = 'fa-solid fa-file-excel fa-2xl';
            break;
        case 'ppt':
        case 'pptx':
            iconClass = 'fa-solid fa-file-powerpoint fa-2xl';
            break;
        default:
            iconClass = 'fa-solid fa-file fa-2xl';
            break;
    }
    
    return iconClass;
}


  // Atribuição de um evento de clique para o elemento com a classe "anexo"
  $(".anexo").click(function () {
    $("#anexo").click();
  });

  $(".filename").click(function () {
    $(".filename2").click();
  });

});

// Atribuição de um evento de alteração para o elemento com o id "anexo"
$("#anexo").change(function (e) {
  // Armazenamento do arquivo selecionado no objeto "file"
  file = e.target.files[0];
});

let form = document.getElementById("form");

// Atribuição de um evento de envio para o formulário com o id "form"
form.addEventListener("submit", function (e) {
  // Prevenção do comportamento padrão do envio do formulário
  e.preventDefault();

  // Obtenção do valor do campo de entrada de mensagem
  let messageInput = e.target.message;
  let message = messageInput.value.trim();
  let send_to;

  // Verificação do ID do usuário logado para determinar o destinatário da mensagem
  if (USER_ID == 1) {
    send_to = 2;
  } else {
    send_to = 1;
  }

  if (message === "" && file == null) {
    Swal.fire({
      icon: "info",
      title: "",
      html: '<p class="text-center">A mensagem está vazia. Por favor, insira um texto válido.</p>',
    });
    return; // Interrompe o envio se a mensagem estiver vazia e nenhum arquivo for selecionado
  }
  // if (message !== "") {
    // Criação de um objeto FormData para enviar os dados do formulário
    var formData = new FormData();
    formData.append('message', message);
    formData.append('user', userLogged.user);
    formData.append('chat', userLogged.chat);
    formData.append('_state', 'sending');
    formData.append('message_type', 'text');
  
    // Verifica se um arquivo foi selecionado
    if (file != null) {
      formData.append('archive', file);
    }
  
    // Envio da requisição AJAX para a URL '/salvar_mensagem/' usando o método POST
    $.ajax({
      url: '/salvar_mensagem/',
      type: 'POST',
      data: formData,
      headers: {
        'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
      },
      processData: false,
      contentType: false,
      success: function (data) {
        if (data.status) {
          // Recarrega a página após o envio bem-sucedido da mensagem
          location.reload();
        }
      }
    });
  
    // Limpa o formulário após o envio da mensagem
    form.reset();
  });

  

const messagesContainer = document.getElementById("messages");

// Define a posição de rolagem do contêiner de mensagens para o final
messagesContainer.scrollTop = messagesContainer.scrollHeight;

const USER_ID = $("logged-in-user").val();
