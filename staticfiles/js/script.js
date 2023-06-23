let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");

closeBtn.onclick = function () {
    sidebar.classList.toggle("active");
    if (sidebar.classList.contains("active")) {
        $(".hide").show();
    } else {
        $(".hide").hide();
        }
    };

$("li").hover(function () {
    if (!sidebar.classList.contains("active")) {
        // over
        $(this).find('span').show();
    }
}, function () {
    if (!sidebar.classList.contains("active")) {
        // out
        $(this).find('span').hide();
    }
});

// hiden span when sidebar not active
$(document).ready(function () {
    if (!sidebar.classList.contains("active")) {
        $("span").hide();
    }
});


// setTimeout(() => {
//     if (sidebar.classList.contains("active")) {
//       $(".hide").show();
//     } else {
//       $(".hide").hide();
//     }
// }, 100);

