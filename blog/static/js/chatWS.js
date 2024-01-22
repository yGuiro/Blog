const userLogged = JSON.parse(
  document.getElementById("user_logado").textContent
);
const USER_ID = document.getElementById('user').value;
const chatLog = document.querySelector("#chat-log");
const main = document.querySelector("#content");
const participants = document.getElementById('participants').value;
let groupName = document.getElementById('group_name').value;
let chatLogo = document.getElementById('chat_logo');
let fileInput = document.querySelector('#anexo');
let file = fileInput.files[0];
let chatId = getChatIdFromURL();
let chatSocket;

if (file !== undefined) {
  let reader = new FileReader();
  reader.onload = function (e) {
    let fileData = reader.result;
  }
  reader.readAsDataURL(file);
} else {
  console.log("Nenhum arquivo selecionado");
}

// Inicialize chatsData
let chatsData = {};

$(".js-example-basic-multiple").select2({
  dropdownParent: $("#novaconversamodal"),
});

$(".aaa").select2({
  dropdownParent: $("#exampleModal2"),
});

// Função para obter chatId da URL
function getChatIdFromURL() {
  const urlSplit = window.location.pathname.split("/");
  // Considera o penúltimo elemento se o último for uma string vazia devido à barra final
  const chatId = urlSplit[urlSplit.length - 1] || urlSplit[urlSplit.length - 2];
  return chatId;
}

// Evento para anexar arquivo
$("#anexo").change(function (e) {
  file = e.target.files[0];
  $("#file-name-placeholder").text(file ? file.name : "");
});

// Evento para abrir seleção de arquivo
$(".anexo").click(function () {
  $("#anexo").click();
});

// Evento para detectar mudança na URL
window.addEventListener("popstate", function (event) {
  chatId = getChatIdFromURL();

});

// Evento para carregar o DOM
document.addEventListener("DOMContentLoaded", function () {
  let groupLinks = document.querySelectorAll(".grupo a");

  groupLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      let groupId = this.getAttribute("data-grupo");
      let currentUrl = new URL(window.location);
      let pathSegments = currentUrl.pathname.split("/");

      chatId = groupId; // Atualiza chatId antes de enviar a mudança
      limparChat();

      chatSocket.send(
        JSON.stringify({
          type: "change_chat",
          newChatId: chatId,
          chat_id: chatId,
          group_name: groupName,
          participants: participants,
          chat_logo: chatLogo,
        })
      );
      
      chatSocket.send(JSON.stringify({
        type: 'chat_history',
        chat_id: chatId,
        user_id: USER_ID,
        group_name: groupName,
        participants: participants,
        chat_logo: chatLogo,
      }));

      chatSocket.send(JSON.stringify({
        type: 'file_upload',
        user_id: USER_ID,
        file_data: fileData,

      }));
      
      pathSegments[pathSegments.length - 1] = groupId;
      currentUrl.pathname = pathSegments.join("/");
      window.history.pushState({}, "", currentUrl);

    });
  });
  startWebSocket(chatId);
  function startWebSocket(chatId) {
    if (chatSocket && chatSocket.readyState !== WebSocket.CLOSED) {
      return;
    }
  
    chatSocket = new WebSocket(
      `wss://${window.location.host}/ws/chat/${chatId}/`
    );
  
    chatSocket.onopen = function (e) {
      console.log("WebSocket Conectado.");
      chatSocket.send(JSON.stringify({
          'type': 'new_message',
          'chat_id': chatId,
          'user_id': USER_ID
      }));
  
      startWebSocket(chatId);
      setTimeout(function () {
      }, 100);
    };
  
    chatSocket.onclose = function (e) {
      alert("Conexão com o servidor perdida. Tentando recarregar a página...")
      window.location.reload();
      console.error(
        "Chat socket fechado inesperadamente. Tentando reconectar..."
      );
      setTimeout(function () {
      }, 5000);
    };
  
    chatSocket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      // const chatLog = document.querySelector("#chat-log");
  
      if (data.type === "chat_message") {
        let messagePara = document.createElement("p");
        if (data.sender === USER_ID) {
            messagePara.classList.add("sent-message");
        } else {
            messagePara.classList.add("received-message");
        }
        const date = new Date();
        const diaAtual = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  
        // Adicione o nome e sobrenome à mensagem
        let nameElement = document.createElement("h5");
        nameElement.textContent = `${data.first_name} ${data.last_name}`;
        messagePara.appendChild(nameElement);
    
        // Adicione a mensagem
        let textElement = document.createElement("p");
        textElement.textContent += data.message;
        messagePara.appendChild(textElement);
        
  
        // Adicione a hora que a mensagem foi enviada
        let dateElement = document.createElement("span");
        dateElement.textContent = diaAtual;
        messagePara.appendChild(dateElement);
    
        if (chatLog) {
            chatLog.appendChild(messagePara);
            main.scrollTop = main.scrollHeight;
        }
  
      } else if (data.type === "chat_history" && chatLog && data.history) {
        let chatName = data.group_name;
          let chatParticipants = data.participants;
          let chatPhoto = data.chat_logo;

          if (chatName) {
              let participantsHTML = ""; // Acumula os participantes em uma string
      
              for (let i = 0; i < chatParticipants.length; i++) {
                  participantsHTML += `<h5>${chatParticipants[i]},&nbsp;</h5>`; // Adiciona cada participante à string
              }
              let logo = "";
              logo += `<img src="/media/${chatPhoto}" alt="" class="ms-2 me-2 logos" style="border-radius: 3rem; width: 3rem; max-height: 3rem;">`
              groupName = chatName;
              document.getElementById('participants').innerHTML = participantsHTML; // Atualiza o HTML
              document.getElementById('group_name').innerHTML = groupName;
              document.getElementById('chatLogo').innerHTML = logo;
          }
        data.history.reverse().forEach(function (message) {
            let messagePara = document.createElement("p");
            let messageSender = message.sender;
            let sender = messageSender.toString();
            let state = message.state;
            let stateMessage = state.toString();
    
            if (sender === USER_ID) {       
              messagePara.classList.add("sent-message");
            } else {
              messagePara.classList.add("received-message");
            }
            const formattedDate = formatDate(message.date);
            
            let nameElement = document.createElement("h5");
            nameElement.textContent = `${message.first_name} ${message.last_name}`;
            messagePara.insertBefore(nameElement, null);
            
            let textElement = document.createElement("p");
            textElement.textContent = message.message;
            messagePara.insertBefore(textElement, null);
    
            if (sender === USER_ID) {
              if (stateMessage === "unread") {
                let checkElement = document.createElement("i");
              checkElement.classList.add("fa-solid");
              checkElement.classList.add("fa-check");
              checkElement.classList.add("cinza");
              $('<i class="fa-solid fa-check cinza"></i>').css({'color': 'gray'})
              messagePara.insertBefore(checkElement, null);
            } else {
                let checkElement = document.createElement("i");
                checkElement.classList.add("fa-solid");
                checkElement.classList.add("fa-check-double");
                checkElement.classList.add("azul");
                $('<i class="fa-solid fa-check azul"></i>').css({'color': '#007bff'})
                messagePara.insertBefore(checkElement, null);
            }
          }
            let dateElement = document.createElement("span");
            dateElement.textContent = formattedDate;
            messagePara.insertBefore(dateElement, null);
        
            chatLog.insertBefore(messagePara, null);        
          });
          main.scrollTop = main.scrollHeight;
          
        } else if (data.type === "last_message_info") {
          const lastMessageInfo = data;
        
          if (lastMessageInfo && lastMessageInfo.last_sender_name) {
            // Atualize as informações no objeto chatsData
            if (!chatsData[lastMessageInfo.chat_id]) {
              chatsData[lastMessageInfo.chat_id] = {};
            }
            chatsData[lastMessageInfo.chat_id].lastSenderName = lastMessageInfo.last_sender_name;
            chatsData[lastMessageInfo.chat_id].lastMessage = lastMessageInfo.last_message;
        
            // Renderize as informações no DOM
            renderLastMessageInfo(lastMessageInfo);
          } else {
            console.error('Mensagem recebida não contém informações válidas sobre a última mensagem:', data);
          }
        } else if (data.type === 'chat_changed') {
          let chatName = data.group_name;
          let chatParticipants = data.participants;
          let chatPhoto = data.chat_logo;
      
          if (chatName) {
              let participantsHTML = ""; // Acumula os participantes em uma string
      
              for (let i = 0; i < chatParticipants.length; i++) {
                  participantsHTML += `<h5>${chatParticipants[i]},&nbsp;</h5>`; // Adiciona cada participante à string
              }
              let logo = "";
              logo += `<img src="/media/${chatPhoto}" alt="" class="ms-2 me-2 logos" style="border-radius: 3rem; width: 3rem; max-height: 3rem;">`
              groupName = chatName;
              document.getElementById('participants').innerHTML = participantsHTML; // Atualiza o HTML
              document.getElementById('group_name').innerHTML = groupName;
              document.getElementById('chatLogo').innerHTML = logo;
          }
      } else if (data.type === 'file_upload') {
        
      };
      setTimeout(function () {
        main.scrollTop = main.scrollHeight;
      }, 100);
    };
    main.scrollTop = main.scrollHeight;
  }
});

function limparChat() {
  document.querySelector("#chat-log").innerHTML = ""; // Limpa o histórico de mensagens
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', options).format(date);
}
// Evento para enviar mensagem
document.querySelector("#chat-message-input").addEventListener("keyup", function (e) {
    if (e.keyCode === 13) {
      document.querySelector("#chat-message-submit").click();
    }
  });

document.querySelector("#chat-message-submit").addEventListener("click", function (e) {
    const messageInputDom = document.querySelector("#chat-message-input");
    const message = messageInputDom.value;

    chatSocket.send(
      JSON.stringify({
        type: "new_message",
        message: message,
        user_id: USER_ID,
        chat_id: chatId,
      })
    );

    chatSocket.send(JSON.stringify({
      'type': 'get_chats',
      'user_id': USER_ID
    }));

    messageInputDom.value = "";
    if (message == "" || message == " " || message == null) {
      alert("Digite uma mensagem!")
    }
    setTimeout(function () {
      main.scrollTop = main.scrollHeight;
    }, 100);
  });

  function renderLastMessageInfo(data) {
    const chatId = data.chat_id;
    const grupoContainer = document.getElementById(chatId);
  
    if (!grupoContainer) {
      console.error('Elemento do grupo não encontrado para chat_id:', chatId);
      return;
    }
  
    const lastSenderContent = grupoContainer.querySelector(".last-sender p");
  
    if (lastSenderContent) {
      // Crie novos elementos para atualizar o conteúdo
      let lastSenderElement = document.createElement("p");
      lastSenderElement.textContent = `${data.last_sender_name}: ${data.last_message}`;
  
      // Limpe o conteúdo anterior e adicione o novo
      lastSenderContent.innerHTML = "";
      lastSenderContent.appendChild(lastSenderElement);
    } else {
      console.error('Elemento de conteúdo não encontrado para chat_id:', chatId);
    }
  }
  
$(document).ready(function () {
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

//   setInterval(function () {
//     renderLastMessageInfo();
// }, 5000);
})
  
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
                window.location.href = "/ws/chat/";
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

