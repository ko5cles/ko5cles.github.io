"use strict";
$(document).ready(function () {
    main();
})

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
