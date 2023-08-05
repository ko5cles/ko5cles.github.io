"use strict";
$(document).ready(function () {
    main();
})
/* global variables */
let update_interval = null;
let key_pressed = null;
let head_position = null;
let cur_dir = null;
let prev_dir = null;
let dir = null;
let score = 0;
let game = null;

/* functions */
function CreateGrid(base) {
    let playgnd = document.getElementById("playground");
    const window_width = $(window).width() * 0.8;
    const window_height = $(window).height() - 200;
    let width = null;
    let height = null;
    if (window.width > window.height) {//horizontal
        width = base;
        height = Math.floor(window_height * width / window_width);
    } else {//vertical
        height = base;
        width = Math.floor(window_width * height / window_height);
    }
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let cell = document.createElement("div");
            cell.setAttribute("class", "grid");
            cell.setAttribute("id", i.toString() + "-" + j.toString());
            playgnd.appendChild(cell);
        }
    }
    /* add css for grid*/
    $(".playground").css({"grid-template-columns": "repeat(" + width.toString() + ",1fr)"});
    $(".grid").css({"border": "black 2px solid", "aspect-ratio": "1/1"});
    return [width, height];
}

function Location2String(location) {
    return "#" + location[0].toString() + "-" + location[1].toString();
}

class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.snake = new Array(height).fill(0).map(() => new Array(width).fill(0));
        this.fruit = new Array(height).fill(0).map(() => new Array(width).fill(0));
        this.Initialize();
    }

    Initialize() {
        this.head = [];
        this.tail = [];
        this.tail_dir = [];
        this.fruit_gone = false;
        this.just_ate = false;
        this.game_over = false;

        let head_column = Math.floor(this.width / 2);
        let head_row = Math.floor(this.height / 2);
        this.head = [head_row, head_column];
        this.tail = [head_row, head_column + 1];
        this.tail_dir.push("l");

        this.Set(this.head, "h"); /* 0 is empty, 1 is head, 2 is body, 3 is tail*/
        this.Set(this.tail, "tl");
        this.SpawnFruit();
    }

    Reset() {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.Clear([i, j], "h");
                this.Clear([i, j], "f");
            }
        }
        this.Initialize();
    }

    Set(location, type) {
        let str = Location2String(location);
        if (type === "h") {
            if (cur_dir === "u") $(str).css("background-image", "url('./assets/head.png')");
            else if (cur_dir === "r") $(str).css({
                "background-image": "url('./assets/head.png')",
                "transform": "rotate(90deg)"
            });
            else if (cur_dir === "d") $(str).css({
                "background-image": "url('./assets/head.png')",
                "transform": "rotate(180deg)"
            });
            else if (cur_dir === "l" || cur_dir === null) $(str).css({
                "background-image": "url('./assets/head.png')",
                "transform": "rotate(270deg)"
            });

            this.snake[location[0]][location[1]] = 1;
        } else if (type === "b") {
            if (cur_dir === prev_dir) {
                if (cur_dir === "u") $(str).css("background-image", "url('./assets/body.png')");
                else if (cur_dir === "r") $(str).css({
                    "background-image": "url('./assets/body.png')",
                    "transform": "rotate(90deg)"
                });
                else if (cur_dir === "d") $(str).css({
                    "background-image": "url('./assets/body.png')",
                    "transform": "rotate(180deg)"
                });
                else if (cur_dir === "l") $(str).css({
                    "background-image": "url('./assets/body.png')",
                    "transform": "rotate(270deg)"
                });
            } else {
                if (prev_dir === "l") {
                    if (cur_dir === "u") $(str).css("background-image", "url('./assets/body-curve.png')");
                    else if (cur_dir === "d") $(str).css({
                        "background-image": "url('./assets/body-curve.png')",
                        "transform": "rotate(90deg)"
                    });
                } else if (prev_dir === "r") {
                    if (cur_dir === "u") $(str).css({
                        "background-image": "url('./assets/body-curve.png')",
                        "transform": "rotate(270deg)"
                    });
                    else if (cur_dir === "d") $(str).css({
                        "background-image": "url('./assets/body-curve.png')",
                        "transform": "rotate(180deg)"
                    });
                } else if (prev_dir === "u") {
                    if (cur_dir === "l") $(str).css({
                        "background-image": "url('./assets/body-curve.png')",
                        "transform": "rotate(180deg)"
                    });
                    else if (cur_dir === "r") $(str).css({
                        "background-image": "url('./assets/body-curve.png')",
                        "transform": "rotate(90deg)"
                    });
                } else if (prev_dir === "d") {
                    if (cur_dir === "l") $(str).css({
                        "background-image": "url('./assets/body-curve.png')",
                        "transform": "rotate(270deg)"
                    });
                    else if (cur_dir === "r") $(str).css("background-image", "url('./assets/body-curve.png')");
                }
            }

            this.snake[location[0]][location[1]] = 2;
        } else if (type === "bf") { // body is full
            if (cur_dir === prev_dir) {
                if (cur_dir === "u") $(str).css("background-image", "url('./assets/body-full.png')");
                else if (cur_dir === "r") $(str).css({
                    "background-image": "url('./assets/body-full.png')",
                    "transform": "rotate(90deg)"
                });
                else if (cur_dir === "d") $(str).css({
                    "background-image": "url('./assets/body-full.png')",
                    "transform": "rotate(180deg)"
                });
                else if (cur_dir === "l") $(str).css({
                    "background-image": "url('./assets/body-full.png')",
                    "transform": "rotate(270deg)"
                });
            } else {
                if (prev_dir === "l") {
                    if (cur_dir === "u") $(str).css("background-image", "url('./assets/body-curve-full.png')");
                    else if (cur_dir === "d") $(str).css({
                        "background-image": "url('./assets/body-curve-full.png')",
                        "transform": "rotate(90deg)"
                    });
                } else if (prev_dir === "r") {
                    if (cur_dir === "u") $(str).css({
                        "background-image": "url('./assets/body-curve-full.png')",
                        "transform": "rotate(270deg)"
                    });
                    else if (cur_dir === "d") $(str).css({
                        "background-image": "url('./assets/body-curve-full.png')",
                        "transform": "rotate(180deg)"
                    });
                } else if (prev_dir === "u") {
                    if (cur_dir === "l") $(str).css({
                        "background-image": "url('./assets/body-curve-full.png')",
                        "transform": "rotate(180deg)"
                    });
                    else if (cur_dir === "r") $(str).css({
                        "background-image": "url('./assets/body-curve-full.png')",
                        "transform": "rotate(90deg)"
                    });
                } else if (prev_dir === "d") {
                    if (cur_dir === "l") $(str).css({
                        "background-image": "url('./assets/body-curve-full.png')",
                        "transform": "rotate(270deg)"
                    });
                    else if (cur_dir === "r") $(str).css("background-image", "url('./assets/body-curve-full.png')");
                }
            }

            this.snake[location[0]][location[1]] = 2;

        } else if (type[0] === "t") {
            if (type[1] === "u") $(str).css("background-image", "url('./assets/tail.png')");
            else if (type[1] === "r") $(str).css({
                "background-image": "url('./assets/tail.png')",
                "transform": "rotate(90deg)"
            });
            else if (type[1] === "d") $(str).css({
                "background-image": "url('./assets/tail.png')",
                "transform": "rotate(180deg)"
            });
            else if (type[1] === "l") $(str).css({
                "background-image": "url('./assets/tail.png')",
                "transform": "rotate(270deg)"
            });

            this.snake[location[0]][location[1]] = 3;
        } else if (type === "f") {
            $(str).css("background-image", "url('./assets/star.png')");
            this.fruit[location[0]][location[1]] = 1;
        } else if (type === "s") {
            if (cur_dir === "u") $(str).css("background-image", "url('./assets/head-heart.png')");
            else if (cur_dir === "r") $(str).css({
                "background-image": "url('./assets/head-heart.png')",
                "transform": "rotate(90deg)"
            });
            else if (cur_dir === "d") $(str).css({
                "background-image": "url('./assets/head-heart.png')",
                "transform": "rotate(180deg)"
            });
            else if (cur_dir === "l" || cur_dir === null) $(str).css({
                "background-image": "url('./assets/head-heart.png')",
                "transform": "rotate(270deg)"
            });

            this.fruit[location[0]][location[1]] = 2;
            this.snake[location[0]][location[1]] = 2;
        } else console.log("set type error!");
    }

    Clear(location, type) {
        let str = Location2String(location);
        if (type === "t" || type === "b" || type === "h") {
            $(str).css({"background-color": "white", "background-image": "none", "transform": "none"});
            this.snake[location[0]][location[1]] = 0;
        } else if (type === "f") {
            $(str).css({"background-image": "none", "transform": "none"});
            this.fruit[location[0]][location[1]] = 0;
        } else console.log("clear type error!");
    }

    SpawnFruit() {
        let raw_number = Math.floor(Math.random() * this.width * this.height);
        let row_number = Math.floor(raw_number / this.width);
        let column_number = raw_number % this.width;
        while (this.snake[row_number][column_number] !== 0) {
            raw_number = Math.floor(Math.random() * this.width * this.height);
            row_number = Math.floor(raw_number / this.width);
            column_number = raw_number % this.width;
        }
        this.Set([row_number, column_number], "f");
    }

    Move(mov_dir) {
        let head_target;
        if (mov_dir === "l") {
            head_target = [this.head[0], this.head[1] - 1];
            if (head_target[1] === -1) {/* hit the wall */
                this.game_over = true;
            }
        } else if (mov_dir === "r") {
            head_target = [this.head[0], this.head[1] + 1];
            if (head_target[1] === this.width) {/* hit the wall */
                this.game_over = true;
            }
        } else if (mov_dir === "u") {
            head_target = [this.head[0] - 1, this.head[1]];
            if (head_target[0] === -1) {/* hit the wall */
                this.game_over = true;
            }
        } else if (mov_dir === "d") {
            head_target = [this.head[0] + 1, this.head[1]];
            if (head_target[0] === this.height) {/* hit the wall */
                this.game_over = true;
            }
        }

        if (this.game_over === true) return; // hit the wall

        if (this.snake[head_target[0]][head_target[1]] !== 0) {/* hit body */
            this.game_over = true;
        } else {
            // head
            if (this.just_ate === true) {
                this.just_ate = false;
                this.Clear(this.head, "h");
                this.Set(this.head, "bf");
            } else {
                this.Clear(this.head, "h");
                this.Set(this.head, "b");
            }
            this.head = head_target;
            //query head position on screen
            head_position = $(Location2String(this.head)).offset();

            if (this.fruit[head_target[0]][head_target[1]] === 1) { // assume only 1 fruit on map
                this.fruit_gone = true;
                this.Set(this.head, "s"); // 0 empty, 1 fruit, 2 to digest
                this.just_ate = true;
                score = score + 5;
            } else {
                this.Set(this.head, "h");
            }

            if (mov_dir === "l") {
                this.tail_dir.push("l");
            } else if (mov_dir === "r") {
                this.tail_dir.push("r");
            } else if (mov_dir === "u") {
                this.tail_dir.push("u");
            } else if (mov_dir === "d") {
                this.tail_dir.push("d");
            }

            // tail
            if (this.fruit[this.tail[0]][this.tail[1]] === 2) { // tail meets fruit to digest
                this.Clear(this.tail, "f");
                this.Set(this.tail, "t" + this.tail_dir[0]);
            } else {
                dir = this.tail_dir.shift();
                this.Clear(this.tail, "t");
                if (dir === "l") this.tail = [this.tail[0], this.tail[1] - 1];
                else if (dir === "r") this.tail = [this.tail[0], this.tail[1] + 1];
                else if (dir === "u") this.tail = [this.tail[0] - 1, this.tail[1]];
                else if (dir === "d") this.tail = [this.tail[0] + 1, this.tail[1]];
                this.Clear(this.tail, "b");
                this.Set(this.tail, "t" + this.tail_dir[0]);
            }
        }
    }

    Update() {
        if (this.game_over === false) {
            prev_dir = cur_dir;
            if (this.fruit_gone === true) {
                this.SpawnFruit();
                this.fruit_gone = false;
            }

            $("#score").text(score);

            if (key_pressed === "ArrowUp" || key_pressed === "w") {
                if (prev_dir === "d") {
                    cur_dir = "d";
                } else {
                    cur_dir = "u";
                }
            } else if (key_pressed === "ArrowDown" || key_pressed === "s") {
                if (prev_dir === "u") {
                    cur_dir = "u";
                } else {
                    cur_dir = "d";
                }
            } else if (key_pressed === "ArrowLeft" || key_pressed === "a") {
                if (prev_dir === "r") {
                    cur_dir = "r";
                } else {
                    cur_dir = "l";
                }
            } else if (key_pressed === "ArrowRight" || key_pressed === "d") {
                if (prev_dir === "l") {
                    cur_dir = "l";
                } else {
                    cur_dir = "r";
                }
            } else if (key_pressed === null) {
                if (prev_dir === null) {
                    cur_dir = "l";
                } else {
                    if (prev_dir === "l") {
                        cur_dir = "l";
                    } else if (prev_dir === "r") {
                        cur_dir = "r";
                    } else if (prev_dir === "u") {
                        cur_dir = "u";
                    } else if (prev_dir === "d") {
                        cur_dir = "d";
                    }
                }
            }
            this.Move(cur_dir);
            key_pressed = null;
        } else {
            clearInterval(update_interval);
            update_interval = null;
            LoadResultBoard();
        }
    }
}

function PrepareGame() {
    $(".start").css({"display": "none", "visibility": "hidden"});
    const base = 10;
    const [width, height] = CreateGrid(base);
    game = new Game(width, height);
    update_interval = setInterval(game.Update.bind(game), 500);
}

function LoadResultBoard() {
    let result_score = document.getElementById("result_score");
    result_score.innerHTML = score;
    if (score > 40) {
        $("#crown_img_1").attr("src", "./assets/crown.png");
    }
    if (score > 80) {
        $("#crown_img_2").attr("src", "./assets/crown.png");
    }

    if (score > 120) {
        $("#crown_img_3").attr("src", "./assets/crown.png");
    }
    $(".result").css({"display": "grid", "visibility": "visible"});
}

function ResetGame() {
    $(".result").css({"display": "none", "visibility": "hidden"});
    //reset global variables
    score = 0;
    key_pressed = null;
    head_position = null;
    cur_dir = null;
    prev_dir = null;
    dir = null;
    //reset crown image
    $("#crown_img_1").attr("src", "./assets/crown-gray.png");
    $("#crown_img_2").attr("src", "./assets/crown-gray.png");
    $("#crown_img_3").attr("src", "./assets/crown-gray.png");
    //reset game
    game.Reset();
    update_interval = setInterval(game.Update.bind(game), 500);
}

function main() {
    $(".start").css({"display": "block", "visibility": "visible"});
    let button = document.getElementById("start_button");
    button.addEventListener("click", PrepareGame);
    let retry_button = document.getElementById("retry");
    retry_button.addEventListener("click", ResetGame);
    // add keyboard support
    document.addEventListener("keydown", (event) => {
        key_pressed = event.key;
    });
    // add touch screen support
    document.addEventListener("click", (event) => {
        if (head_position !== null) {
            let x = event.clientX, y = event.clientY;
            let head_x = head_position["left"], head_y = head_position["top"];
            if (cur_dir === "u" || cur_dir === "d") {
                if (x < head_x) key_pressed = "a";
                else if (x > head_x) key_pressed = "d";
            } else if (cur_dir === "l" || cur_dir === "r") {
                if (y > head_y) key_pressed = "s";
                else if (y < head_y) key_pressed = "w";
            }
        }
    })
}