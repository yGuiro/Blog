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

  function getIconClass(extension) {
    var iconClass = "";

    switch (extension) {
      case "pdf":
        iconClass = "fa-solid fa-file-pdf fa-2xl";
        break;
      case "doc":
      case "docx":
        iconClass = "fa-solid fa-file-word fa-2xl";
        break;
      case "xls":
      case "xlsx":
        iconClass = "fa-solid fa-file-excel fa-2xl";
        break;
      case "ppt":
      case "pptx":
        iconClass = "fa-solid fa-file-powerpoint fa-2xl";
        break;
      default:
        iconClass = "fa-solid fa-file fa-2xl";
        break;
    }

    return iconClass;
  }

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
        location.reload();
      }
    },
  });
  form.reset();
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

// Chama a função para marcar a última mensagem como lida ao abrir a conversa
marcarUltimaMensagemLida();


// const messageIdToMarkAsRead = chatId;
// marcarMensagemLida(messageIdToMarkAsRead);

const messagesContainer = document.getElementById("messages");

messagesContainer.scrollTop = messagesContainer.scrollHeight;