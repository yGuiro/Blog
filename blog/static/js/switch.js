function loadTheme() {
    const theme = localStorage.getItem('theme');

    if (theme === 'dark') {
        darkTheme();
    } else {
        whiteTheme();
    }

    return theme;
}

function darkTheme() {
    localStorage.setItem('theme', 'dark');
    $(".fa-sun").removeClass("fa-sun").addClass("fa-moon");
    $("body").removeClass("white-theme").addClass("dark-theme");
    $("span,h1,i,p,h3,h4,h5").removeClass("black-text");
    $('#teste').removeClass("container-main--nav-dark").addClass("container-main--nav")
    $(".conteudos").removeClass("container-main--nav-dark").addClass("dark-theme");
    $('.contDark').removeClass("conteudos-white").addClass("conteudos")
    $("#img-promoclick").remove()
    $("#promoclick-logo").append("<img src='../../static/images/logo-promoclick.png' alt='' style='width: 16vw; height: 6vh;' id='img-promoclick'>")
}

function whiteTheme() {
    localStorage.setItem('theme', 'white');
    $("body").removeClass("dark-theme").addClass("white-theme");
    $(".fa-moon").removeClass("fa-moon").addClass("fa-sun");
    $("span,h1,i,p,h3,h4,h5").addClass("black-text");
    $('#teste').removeClass("container-main--nav").addClass("container-main--nav-dark")
    $(".conteudos").removeClass("dark-theme").addClass("conteudos-white");
    $("#img-promoclick").remove()
    $("#promoclick-logo").append("<img src='../../static/images/promoclick-black.png' alt='' style='width: 16vw; height: 6vh;' id='img-promoclick'>")
}

$(document).ready(function () {
    $("#promoclick-logo").append("<img src='../../static/images/logo-promoclick.png' alt='' style='width: 16vw; height: 6vh;' id='img-promoclick'>")
    
    $('#switch-btn').click(function() {

        if ($(".fa-moon").hasClass("fa-moon")) {
            whiteTheme();
        } else {
            darkTheme();
        }

        console.log(loadTheme());
    });

    loadTheme();
});