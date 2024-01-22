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


// console.log(chatId);

$(document).ready(function () {
  setInterval(function () {
    Notification.requestPermission();
  },5000);
})

console.log(Notification.permission);

$(document).ready(function () {

  if (userLogged == 'chat') {
    $("#contat-info").attr("style", "display: none !important;");
    $("#digitarMensagem").attr("style", "display: none !important;");
    
  }

  $('.editMessage').click(function () {
    console.log("clicou");
    alert("clicou");
  })

  Notification.requestPermission()


  function removePartOfLink() {
    var currentURL = window.location.href;
    var modifiedURL = currentURL.replace(`/${chatId}`, "");
    window.location.href = modifiedURL;
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Esc") {
      removePartOfLink(); 
    }
  });


  $(".js-example-basic-multiple").select2({
    dropdownParent: $("#novaconversamodal"),
  });

  $(".aaa").select2({
    dropdownParent: $("#exampleModal2"),
  });

  $(".bbb").select2({
    dropdownParent: $("#exampleModal3"),
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
  const nomeConversaInput = formModal.querySelector('input[name="nome_conversa"]');

  if (nomeConversaInput.value.trim() === "") {
    Swal.fire({
      icon: "info",
      title: "",
      html: '<p class="text-center">Por favor, insira o nome da conversa.</p>',
    });
    return;
  }

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


$("#btnEdit").click(function () {
  const formModal = document.getElementById("formEdit");
  const formData = new FormData(formModal);

  $.ajax({
    url: `/editar_conversa/${chatId}/`,
    type: "POST",
    data: formData,
    headers: {
      "X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').val(),
    },
    processData: false,
    contentType: false,
    success: function (data) {
      if (data.status) {
        Swal.fire({
          icon: "success",
          title: "Grupo alterado com sucesso!",
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          location.reload();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: data.error,
        });
        console.log(data);
      }
    },
    error: function (jqXHR) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: jqXHR.responseJSON.error,
      });
    }
  });
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
          // console.log("Última mensagem marcada como lida com sucesso.");
        } else {
          // console.error("Erro ao marcar a última mensagem como lida.");
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


  if (chatId == 'chat') {
    $("#contat-info").attr("style", "display: none !important;");
    $("#digitarMensagem").attr("style", "display: none !important;");
    
  }

  // Chamar a função para marcar a última mensagem como lida
  marcarUltimaMensagemLida();
  // Definir o intervalo de atualização das mensagens (por exemplo, 5 segundos)
  setInterval(function () {
      obterMensagens();
  }, 5000);
});



let notificationDisplayed = false; // Variável de controle

const NOTIFICATION_INTERVAL = 5 * 60 * 1000; // 5 minutos em milissegundos
let lastNotificationTime = 0; // Guarda o tempo da última notificação

function newMessages(chatId, notificationElement) {
  $.ajax({
    url: `/newMessages/${chatId}/`,
    dataType: "json",
    success: function (data) {
      var lastMessage = data[data.length - 1];
      if (lastMessage && lastMessage.state === "unread" && lastMessage.user_id !== USER_ID) {
        // Atualiza a interface do usuário para indicar nova mensagem
        notificationElement.empty();
        const newText = '<p class="d-flex ms-3 justify-content-center align-items-center" style="background-color: #ffd43b; border-radius: 50%; padding: 4px; color: black; width: 1.5rem; height: 1.5rem;">1</p>';
        notificationElement.append(newText);

        var chatElement = notificationElement.closest(".contact-name");
        chatElement.attr("data-updated-at", new Date().toISOString());

        // Verifica se pode exibir a notificação
        var currentTime = new Date().getTime();
        if ("Notification" in window && Notification.permission === "granted" && (currentTime - lastNotificationTime > NOTIFICATION_INTERVAL)) {
          var notification = new Notification("Nova mensagem recebida", {
            body: "Você tem uma nova mensagem!!",
            icon: '/static/images/PROMOCLICK.ico',
            badge: '/static/images/PROMOCLICK.ico',
          });

          notification.onclick = function () {
            window.location.href = "/chat/" + chatId;
          };
          lastNotificationTime = currentTime; // Atualiza o tempo da última notificação
          $("title").text("(1) Chat");

        }
      }
    },
    error: function (error) {
      console.error("Erro ao obter mensagens para o chat", chatId, ":", error);
    },
  });
}

window.newMessages = newMessages;

$(document).ready(function () {

function updateChatOrder() {
  var chats = $(".conv .contact-name").toArray().sort(function(a, b) {
    var updatedAtA = $(a).attr("data-updated-at") || "1970-01-01T00:00:00";
    var updatedAtB = $(b).attr("data-updated-at") || "1970-01-01T00:00:00";

    var dateA = new Date(updatedAtA.replace(" ", "T"));
    var dateB = new Date(updatedAtB.replace(" ", "T"));

    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      console.error("Invalid date format in data-updated-at");
      return 0;
    }

    return dateB - dateA;
  });

  var parent = $(".conv");
  chats.forEach(function(chat) {
    parent.append(chat);
  });
}

$(document).ready(function() {
  $(".contact-name").each(function() {
  });
  setInterval(function () {
    updateChatOrder();
  }, 5000);
});
})

setInterval(function () {
  $(".notification").each(function() {
    var chatId = $(this).closest(".contact-name").attr("id");
    var notificationElement = $(this);
    newMessages(chatId, notificationElement);
  });
}, 5000);


$('#btnDelete').click(function () {
  Swal.fire({
    title: 'Tem certeza que deseja excluir essa conversa?',
    text: "Você não poderá reverter essa ação!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#035d4d',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sim, excluir!',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: `/excluir_conversa/${chatId}/`,
        type: "POST",
        data: {
          csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val(),
        },
        success: function (data) {
          if (data.status) {
            Swal.fire({
              icon: "success",
              title: "Conversa excluída com sucesso!",
              showConfirmButton: false,
              timer: 1500
            }).then(() => {
              window.location.href = "/chat/";
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: data.error,
            });
            console.log(data);
          }
        },
        error: function (jqXHR) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: jqXHR.responseJSON.error,
          });
        }
      });
    }
  })
})


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

      var inputRead = $("input[name='input_read']").val();
      var userLogged = "{{ user_logged.user }}";

      data.forEach(function (mensagem) {
        // console.log("mensagem:", mensagem);

          // Verificar se o chat_id da mensagem é igual ao ID da conversa
          if (mensagem.chat_id == inputRead) {
              var messageHTML = ''; // Variável para armazenar a estrutura HTML da mensagem
              
              var dataFormatada = mensagem.created_date ? dayjs(mensagem.created_date).format('DD/MM/YYYY HH:mm') : '';
              // Verificar se o usuário logado é o mesmo que enviou a mensagem
              if (mensagem.user_id == USER_ID) {
                  // MENSAGEM ENVIADA
                  messageHTML += '<div id="send" align="right">';
                  messageHTML += '<div class="pe-4 mt-3 nome">';
                  // messageHTML += mensagem.user__first_name + " " + mensagem.user__last_name;
                  messageHTML += '</div>';

                  // Verificar se a mensagem possui arquivo ou é apenas texto
                  if (mensagem.archive == "") {
                    if (mensagem.state == "unread") {
                      messageHTML += '<div class="mensagens_send d-flex flex-column-reverse" style="margin-bottom: 0; word-wrap: break-word !important; overflow-wrap: break-word !important;" id="mensagem_j">';
                      messageHTML += '<div class="d-flex flex-row justify-content-between">';
                      messageHTML += '<p class="editMessage" style="cursor: pointer;">'
                      messageHTML += '</p>'
                      messageHTML += '<i class="fa-solid fa-check mb-2" style="color: gray;"></i>';
                      messageHTML += '</div>';
                      // messageHTML += mensagem.user__first_name + " " + mensagem.user__last_name;
                      // messageHTML += '<br class="mb-5">'
                      messageHTML += mensagem.message;
                      messageHTML += '</div>';
                    } else {
                      messageHTML += '<div class="mensagens_send d-flex flex-column-reverse" style="margin-bottom: 0; word-wrap: break-word !important; overflow-wrap: break-word !important;">';
                      messageHTML += '<div class="d-flex flex-row justify-content-between">';
                      messageHTML += '<p class="editMessage">'
                      // TA AQUI
                      messageHTML += '<i class="fa-solid fa-pen" style="color: #035d4d; title="Editar mensagem" data-bs-toggle="modal" data-bs-target="#exampleModal3"></i>';
                      messageHTML += '</p>'
                      messageHTML += '<i class="fa-solid fa-check mt-2" style="color: #1ad1ff;"></i>';
                      messageHTML += '</div>';
                      messageHTML += mensagem.message;
                      messageHTML += '</div>';
                    }
                      // messageHTML += '<p class="d-flex">' + mensagem.message + '</p>';
                      // messageHTML += '</p>';
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
                      // messageHTML += '<i class="fa-solid fa-pen" style="color: #ffd43b;"></i>';
                      messageHTML += '</p>';
                      messageHTML += '</div>';
                    }
                    
                  messageHTML += '<p style="margin-bottom: 0; font-weight: normal; color: #ffd43b" class="pe-4">';
                  messageHTML += dataFormatada;
                  messageHTML += '</p>';
                  messageHTML += '</div>';
              } else {
                  // MENSAGEM RECEBIDA
                  messageHTML += '<div id="receive" align="left">';
                  messageHTML += '<div class="ps-4 mt-3 nome" style="word-wrap: break-word !important; overflow-wrap: break-word !important;">';
                  // messageHTML += mensagem.user__username;
                  messageHTML += '</div>';

                  // Verificar se a mensagem possui arquivo ou é apenas texto
                  if (mensagem.archive == "") {
                      messageHTML += '<div class="mensagens d-flex flex-column" style="margin-bottom: 0; word-wrap: break-word !important; overflow-wrap: break-word !important;">';
                      messageHTML += '<p class="mb-1" style="color: #ffd43b; text-transform: uppercase; font-size: large;">';
                      messageHTML += mensagem.user__first_name + " " + mensagem.user__last_name;
                      messageHTML += '</p>';
                      messageHTML += '<p>' + mensagem.message + '</p>';
                      messageHTML += '</div>';
                  } else {
                      // Caso possua arquivo
                      messageHTML += '<div class="flex-column">';
                      messageHTML += '<p class="mensagens d-flex flex-column" style="margin-bottom: 0;">';
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
                  messageHTML += '<p style="margin-bottom: 0;  color: #ffd43b;" class="ps-4">';
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
Notification.requestPermission()