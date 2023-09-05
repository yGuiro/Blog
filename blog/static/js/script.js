    const userLogged = JSON.parse(
    document.getElementById("user_logado").textContent
    );


    document.addEventListener('DOMContentLoaded', function() {
        $('#toggleButton').click(function() {
            $('#sidebar').toggleClass('show-menu');
            $('#icon').toggleClass('fa-regular fa-x fa-lg')
        });
    
    
        $("#modalButton").click(function () {
            const form = $("#formEmail")[0];
            const formData = new FormData(form);
    
            $.ajax({
                type: "POST",
                url: "/abrir_chamado/",
                data: formData,
                headers: {
                    "X-CSRFToken": $('input[name="csrfmiddlewaretoken"]').val(),
                },
                processData: false,
                contentType: false,
                beforeSend: function () {
                    Swal.fire({
                        title: "Aguarde...",
                        text: "Estamos criando seu chamado!",
                        showCancelButton: false,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading();
                        },
                    });
                },
                success: function (response) {
                    Swal.fire({
                        icon: "success",
                        title: "Chamado criado com sucesso!",
                        text: "Em breve entraremos em contato com você!",
                        confirmButtonText: "Ok",
                    });
                    $("#abrir_chamado").modal("hide");
                    $("#formEmail")[0].reset();
                },
                error: function (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Erro ao criar chamado!",
                        text: "Por favor, tente novamente!",
                        confirmButtonText: "Ok",
                    });
                },
            });
        });
    });
    