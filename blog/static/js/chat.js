const userLogged = JSON.parse(
  document.getElementById("user_logado").textContent
);
// const USER_ID = $("logged-in-user").val();
const USER_ID = userLogged.user;
console.log(USER_ID);

var file = null;

const url = window.location.href;
const urlSplit = url.split("/");

const chatId = urlSplit[urlSplit.length - 1];

console.log(chatId);

$(document).ready(function () {


  $(".js-example-basic-multiple").select2({
    dropdownParent: $("#novaconversamodal"),
  });

  $(".filename").each(function () {
    var filePath = $(this).prev("img").attr("src");
    var filename = filePath.substring(filePath.lastIndexOf("/") + 1);
    var extension = filename.split(".").pop().toLowerCase();
    var iconClass = getIconClass(extension);
    $(this).html('<i class="' + iconClass + '"></i> ' + filename);
  });


  $(".anexo").click(function () {
    $("#anexo").click();
  });

  $(".filename").click(function () {
    $(".filename2").click();
  });
});

$("#anexo").change(function (e) {
  // Armazenamento do arquivo selecionado no objeto "file"
  file = e.target.files[0];

  // Exibir o nome do arquivo selecionado no elemento HTML
  if (file) {
    $("#file-name-placeholder").text(file.name);
  } else {
    $("#file-name-placeholder").text(""); // Se nenhum arquivo for selecionado, limpar o texto
  }
});

let form = document.getElementById("form");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  let messageInput = e.target.message;
  let message = messageInput.value.trim();
  let send_to;

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
    return;
  }

  var formData = new FormData();
  formData.append("message", message);
  formData.append("user", userLogged.user);
  formData.append("chat", userLogged.chat);
  formData.append("_state", "sending");
  formData.append("message_type", "text");

  if (file != null) {
    formData.append("archive", file);
  }
  $.ajax({
    url: "/salvar_mensagem/",
    type: "POST",
    data: formData,
    headers: {
      "X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').val(),
    },
    processData: false,
    contentType: false,
    success: function (data) {
      if (data.status) {
        // location.reload();
        $("#anexo").val(null);
        $("#file-name-placeholder").text("");
        file = null;
        
      }
    },
  });
  form.reset();
  $("#anexo").wrap('<form>').closest('form').get(0).reset();
  $("#anexo").unwrap();
  
});

var selectElement = document.getElementById("selectUsuarios");

for (var i = 0; i < selectElement.options.length; i++) {
  if (selectElement.options[i].value == userLogged.user) {
    selectElement.options[i].selected = true;
    break;
  }
}

$("#modalButton").click(function () {
  const formModal = document.getElementById("form-modal");
  const formData = new FormData(formModal);

  $.ajax({
    url: "/criar_conversa/",
    type: "POST",
    data: formData,
    headers: {
      "X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').val(),
    },
    processData: false,
    contentType: false,
    success: function (data) {
      if (data.status) {
        location.reload();
      }
    },
  });
  $("#novaconversamodal").modal("hide");
});

function marcarUltimaMensagemLida() {
  if (Number.isInteger(USER_ID)) {
    $.ajax({
      url: `/mensagem_lida/${chatId}/`,
      type: "POST",
      data: {
        user_id: USER_ID,
        csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
      },
      success: function (data) {
        if (data.status) {
          console.log("Última mensagem marcada como lida com sucesso.");
        } else {
          console.error("Erro ao marcar a última mensagem como lida.");
        }
      },
      error: function (error) {
        console.error("Erro na solicitação AJAX:", error);
      },
    });
  } else {
    console.error("USER_ID inválido:", USER_ID);
  }
}

$(document).ready(function () {
  // Chamar a função para marcar a última mensagem como lida
  marcarUltimaMensagemLida();
  // Definir o intervalo de atualização das mensagens (por exemplo, 5 segundos)
  setInterval(function () {
      obterMensagens();
  }, 5000);
});



// Função para obter as mensagens do servidor
function obterMensagens() {
  $.ajax({
      url: `/obter_mensagens/${chatId}/`,
      type: "GET",
      dataType: "json",
      success: function (data) {
          // Chamar a função para exibir as novas mensagens
          mostrarNovasMensagens(data);
      },
      error: function (error) {
          console.error("Erro ao obter mensagens:", error);
      },
  });
}
console.log(obterMensagens());

// Função para exibir as novas mensagens recebidas do servidor
function mostrarNovasMensagens(data) {
  // Se o servidor retornar um array de mensagens, iteramos sobre ele
  if (Array.isArray(data)) {
      var mensagensDiv = $("#messages");
      mensagensDiv.empty(); 


      // Ordenar as mensagens com base na data, da mais recente para a mais antiga
      data.sort(function(a, b) {
        return new Date(a.created_date) - new Date(b.created_date);
      });

      var inputRead = $("input[name='input_read']").val(); // Capturar o ID da conversa do input hidden
      var userLogged = "{{ user_logged.user }}"; // Capturar o ID do usuário logado

      data.forEach(function (mensagem) {


          // Verificar se o chat_id da mensagem é igual ao ID da conversa
          if (mensagem.chat_id == inputRead) {
              var messageHTML = ''; // Variável para armazenar a estrutura HTML da mensagem
              
              var dataFormatada = mensagem.created_date ? dayjs(mensagem.created_date).format('DD/MM/YYYY HH:mm') : '';
              // Verificar se o usuário logado é o mesmo que enviou a mensagem
              if (mensagem.user_id == USER_ID) {
                
                  // MENSAGEM ENVIADA
                  messageHTML += '<div id="send" align="right">';
                  messageHTML += '<div class="pe-4 nome">';
                  messageHTML += mensagem.user__username;
                  messageHTML += '</div>';

                  // Verificar se a mensagem possui arquivo ou é apenas texto
                  if (mensagem.archive == "") {
                    if (mensagem.state == "unread") {
                      messageHTML += '<p class="mensagens_send d-flex flex-column-reverse" style="margin-bottom: 0;" id="mensagem_j"><i class="fa-solid fa-check" style="color: gray;"></i>';
                    } else {
                      messageHTML += '<p class="mensagens_send d-flex flex-column-reverse" style="margin-bottom: 0;"><i class="fa-solid fa-check" style="color: #1ad1ff;"></i>';
                    }
                      messageHTML += mensagem.message;
                      // messageHTML += '<i class="fa-solid fa-check" style="color: #1ad1ff;"></i>';
                      messageHTML += '</p>';
                    } else {
                      // Caso possua arquivo
                      messageHTML += '<div class="flex-column">';
                      messageHTML += '<p class="mensagens_send d-flex flex-column" style="margin-bottom: 0;">';
                      messageHTML += '<img src="../media/' + mensagem.archive + '" alt="">';
                      messageHTML += '<a href="/media/' + mensagem.archive + '" download>';
                      messageHTML += '<img src="../media/' + mensagem.archive + '" alt="" hidden>';
                      messageHTML += '<span class="filename" data-extension="' + mensagem.archive.slice(-3) + '" style="font-size: medium !important; word-wrap: break-word !important; overflow-wrap: break-word !important;">' + mensagem.archive.slice(8) + '</span>';
                      messageHTML += '<i class=" ms-2 fa-regular fa-circle-down fa-2xl" style="color: #f8bf00;"></i>';
                      messageHTML += '</a>';
                      messageHTML += mensagem.message;
                      messageHTML += '</p>';
                      messageHTML += '</div>';
                    }
                    
                  messageHTML += '<p style="margin-bottom: 0; font-weight: 600;" class="pe-4">';
                  messageHTML += dataFormatada;
                  messageHTML += '</p>';
                  messageHTML += '</div>';
              } else {
                  // MENSAGEM RECEBIDA
                  messageHTML += '<div id="receive" align="left">';
                  messageHTML += '<div class="ps-4 nome">';
                  messageHTML += mensagem.user__username;
                  messageHTML += '</div>';

                  // Verificar se a mensagem possui arquivo ou é apenas texto
                  if (mensagem.archive == "") {
                      messageHTML += '<p class="mensagens d-flex flex-column" style="margin-bottom: 0;">';
                      messageHTML += mensagem.message;
                      messageHTML += '</p>';
                  } else {
                      // Caso possua arquivo
                      messageHTML += '<div class="flex-column">';
                      messageHTML += '<p class="mensagens d-flex flex-column" style="margin-bottom: 0;">';
                      messageHTML += '<img src="../media/' + mensagem.archive + '" alt="">';
                      messageHTML += '<a href="/media/' + mensagem.archive + '" download>';
                      messageHTML += '<img src="../media/' + mensagem.archive + '" alt="" hidden>';
                      messageHTML += '<span class="filename" data-extension="' + mensagem.archive.slice(-3) + '" style="font-size: medium !important; word-wrap: break-word !important; overflow-wrap: break-word !important;>' + mensagem.archive.slice(8) + '</span>';
                      messageHTML += '<i class=" ms-2 fa-regular fa-circle-down fa-2xl" style="color: #f8bf00;"></i>';
                      messageHTML += '</a>';
                      messageHTML += mensagem.message;
                      messageHTML += '</p>';
                      messageHTML += '</div>';
                  }
                  messageHTML += '<p style="margin-bottom: 0; font-weight: 600;" class="ps-4">';
                  messageHTML += dataFormatada;
                  messageHTML += '</p>';
                  messageHTML += '</div>';
              }

              // Adicionar a mensagem na div de mensagens
              mensagensDiv.append(messageHTML);
          }
      });

      // Rolar para a parte inferior para exibir as novas mensagens
      var messagesContainer = document.getElementById("messages");
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

const messagesContainer = document.getElementById("messages");
messagesContainer.scrollTop = messagesContainer.scrollHeight;