function Rotate(elem, start, end) {
    if (start < end) {
        let timer = setInterval(function () {
            start+=5;
            elem.css("rotate", start + "deg");
            if (start === end) clearInterval(timer);
        })
    } else {
        let timer = setInterval(function () {
            start-=5;
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