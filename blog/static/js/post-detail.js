document.addEventListener("DOMContentLoaded", function () {
    $("#toggleButton").click(function () {
        $("#grid").toggleClass("show-menu");
        $('#icon').toggleClass('fa-regular fa-x fa-lg');
    });
    
});