$(document).ready(function () {
  $(".anexo").click(function () {
    $("#anexo").click();
  });
});

let url = `ws://${window.location.host}/ws/socket-server/`;

const chatSocket = new WebSocket(url);

chatSocket.onmessage = function (e) {
  let data = JSON.parse(e.data);
  console.log("Data", data);

  function newMessage(message, sent_by_id) {
    if (sent_by_id == USER_ID) {
      if (data.type === "chat") {
        let messages = document.getElementById("messages");

        messages.insertAdjacentHTML(
          "beforeend",
          `<div>
                        <p style="  color: white;
                                    width: 350px;
                                    background-color: #035d4d;
                                    padding-left: 20px;
                                    padding-right: 14px;
                                    padding-bottom: 10px;
                                    padding-top: 10px;
                                    border-radius: 9px;
                                    border: 1px solid;
                                    margin-right: 15px;">
                            ${data.message}
                        </p>
                </div>`
        );
      }
    } else {
      messages.insertAdjacentHTML(
        "beforeend",
        `<div>
            <p style="  color: white;
                        width: 350px;
                        background-color: #035d4d;
                        padding-left: 20px;
                        padding-right: 14px;
                        padding-bottom: 10px;
                        padding-top: 10px;
                        border-radius: 9px;
                        border: 1px solid;
                        margin-right: 15px;
                        margin-left: 250px">${data.message}
            </p>
        </div>`
      );
    }
  }
};

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

  if (message !== "") {
    // Verifica se a mensagem não está vazia
    chatSocket.send(
      JSON.stringify({
        message: message,
        sent_by: USER_ID,
        send_to: send_to,
      })
    );
    form.reset();
  } else {
    // Ação a ser tomada quando o usuário envia uma mensagem vazia (opcional)
    alert("A mensagem está vazia. Por favor, insira um texto válido.");
  }
});

const USER_ID = $("logged-in-user").val();
