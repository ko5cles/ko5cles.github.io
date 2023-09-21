"use strict";
$(document).ready(function () {
    main();
})

function Rotate(elem, start, end) {
    if (start < end) {
        let timer = setInterval(function () {
            start++;
            elem.css("rotate", start + "deg");
            if (start === end) clearInterval(timer);
        })
    } else {
        let timer = setInterval(function () {
            start--;
            elem.css("rotate", start + "deg");
            if (start === end) clearInterval(timer);
        })
    }
}

function CallMenu() {
    let menu = $(".mobile-navbar .menu");
    let img = $("#hamburger img");
    let bar = $(".mobile-navbar");
    if (menu.css("display") === "none") {
        Rotate(img, 0, 90);
        menu.css("display", "grid");
        bar.css({"border": "gray 2px solid", "border-radius": "5px"});
    } else {
        Rotate(img, 90, 0);
        menu.css("display", "none");
        bar.css({"border": "none", "border-radius": "none"});
    }
}

function MoveUp(elem, height) {
    let pos = -height;
    let timer = setInterval(function () {
        pos++;
        elem.style.bottom = pos + "px";
        if (pos === 0) clearInterval(timer);
    }, 25);
}

function MoveDown(elem, height) {
    let pos = 0;
    let timer = setInterval(function () {
        pos--;
        elem.style.bottom = pos + "px";
        if (pos === -height) clearInterval(timer);
    }, 25);
}

function main() {
    let elem = document.getElementById("capybara");
    MoveUp(elem, 160);
    elem.addEventListener("click", function () {
        MoveDown(elem, 160);
    });
}
