"use strict";
$(document).ready(function () {
    main();
})
/* global variables */
let update_interval = null;
let key_pressed = null;
let head_position = null;
let cur_dir = null;
let score = 0;
let game = null;

/* functions */
function AddStartButton() {
    let button = document.createElement("button");
    button.setAttribute("id", "start_button");
    button.innerText = "START";
    let playgnd = document.getElementById("playground");
    playgnd.appendChild(button);
    /* add css for button*/
    $("#start_button").css({"font-size": "32px", "font-family": "monospace"})
    return button;
}

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
        this.Set(this.tail, "t");
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
            $(str).css("background-color", "green");
            this.snake[location[0]][location[1]] = 1;
        } else if (type === "b") {
            $(str).css("background-color", "yellow");
            this.snake[location[0]][location[1]] = 2;
        } else if (type === "t") {
            $(str).css("background-color", "red");
            this.snake[location[0]][location[1]] = 3;
        } else if (type === "f") {
            $(str).css("background-color", "purple");
            this.fruit[location[0]][location[1]] = 1;
        } else if (type === "s") {
            $(str).css("background-color", "orange");
            this.fruit[location[0]][location[1]] = 2;
            this.snake[location[0]][location[1]] = 2;
        } else console.log("set type error!");
    }

    Clear(location, type) {
        let str = Location2String(location);
        if (type === "t" || type === "b" || type === "h") {
            $(str).css("background-color", "white");
            this.snake[location[0]][location[1]] = 0;
        } else if (type === "f") {
            $(str).css("background-color", "white");
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

    MoveLeft() {
        let head_target = [this.head[0], this.head[1] - 1];
        if (head_target[1] === -1) {/* hit the wall */
            this.game_over = true;
        } else if (this.snake[head_target[0]][head_target[1]] !== 0) {/* hit body */
            this.game_over = true;
        } else {
            // head
            if (this.just_ate === true) {
                this.just_ate = false;
            } else {
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
            this.tail_dir.push("l");
            cur_dir = "l";
            // tail
            if (this.fruit[this.tail[0]][this.tail[1]] === 2) { // tail meets fruit to digest
                this.Clear(this.tail, "f");
                this.Set(this.tail, "t");
            } else {
                let dir = this.tail_dir.shift();
                this.Clear(this.tail, "t");
                if (dir === "l") this.tail = [this.tail[0], this.tail[1] - 1];
                else if (dir === "r") this.tail = [this.tail[0], this.tail[1] + 1];
                else if (dir === "u") this.tail = [this.tail[0] - 1, this.tail[1]];
                else if (dir === "d") this.tail = [this.tail[0] + 1, this.tail[1]];
                this.Set(this.tail, "t");
            }
        }
    }

    MoveRight() {
        let head_target = [this.head[0], this.head[1] + 1];
        if (head_target[1] === this.width) {/* hit the wall */
            this.game_over = true;
        } else if (this.snake[head_target[0]][head_target[1]] !== 0) {/* hit body */
            this.game_over = true;
        } else {
            // head
            if (this.just_ate === true) {
                this.just_ate = false;
            } else {
                this.Set(this.head, "b");
            }
            this.head = head_target;
            head_position = $(Location2String(this.head)).offset();

            if (this.fruit[head_target[0]][head_target[1]] === 1) { // assume only 1 fruit on map
                this.fruit_gone = true;
                this.Set(this.head, "s"); // 0 empty, 1 fruit, 2 to digest
                this.just_ate = true;
                score = score + 5;
            } else {
                this.Set(this.head, "h");
            }
            this.tail_dir.push("r");
            cur_dir = "r";
            // tail
            if (this.fruit[this.tail[0]][this.tail[1]] === 2) { // tail meets fruit to digest
                this.Clear(this.tail, "f");
                this.Set(this.tail, "t");
            } else {
                let dir = this.tail_dir.shift();
                this.Clear(this.tail, "t");
                if (dir === "l") this.tail = [this.tail[0], this.tail[1] - 1];
                else if (dir === "r") this.tail = [this.tail[0], this.tail[1] + 1];
                else if (dir === "u") this.tail = [this.tail[0] - 1, this.tail[1]];
                else if (dir === "d") this.tail = [this.tail[0] + 1, this.tail[1]];
                this.Set(this.tail, "t");
            }
        }
    }

    MoveUp() {
        let head_target = [this.head[0] - 1, this.head[1]];
        if (head_target[0] === -1) {/* hit the wall */
            this.game_over = true;
        } else if (this.snake[head_target[0]][head_target[1]] !== 0) {/* hit body */
            this.game_over = true;
        } else {
            // head
            if (this.just_ate === true) {
                this.just_ate = false;
            } else {
                this.Set(this.head, "b");
            }
            this.head = head_target;
            head_position = $(Location2String(this.head)).offset();

            if (this.fruit[head_target[0]][head_target[1]] === 1) { // assume only 1 fruit on map
                this.fruit_gone = true;
                this.Set(this.head, "s"); // 0 empty, 1 fruit, 2 to digest
                this.just_ate = true;
                score = score + 5;
            } else {
                this.Set(this.head, "h");
            }
            this.tail_dir.push("u");
            cur_dir = "u";
            // tail
            if (this.fruit[this.tail[0]][this.tail[1]] === 2) { // tail meets fruit to digest
                this.Clear(this.tail, "f");
                this.Set(this.tail, "t");
            } else {
                let dir = this.tail_dir.shift();
                this.Clear(this.tail, "t");
                if (dir === "l") this.tail = [this.tail[0], this.tail[1] - 1];
                else if (dir === "r") this.tail = [this.tail[0], this.tail[1] + 1];
                else if (dir === "u") this.tail = [this.tail[0] - 1, this.tail[1]];
                else if (dir === "d") this.tail = [this.tail[0] + 1, this.tail[1]];
                this.Set(this.tail, "t");
            }
        }
    }

    MoveDown() {
        let head_target = [this.head[0] + 1, this.head[1]];
        if (head_target[0] === this.height) {/* hit the wall */
            this.game_over = true;
        } else if (this.snake[head_target[0]][head_target[1]] !== 0) {/* hit body */
            this.game_over = true;
        } else {
            // head
            if (this.just_ate === true) {
                this.just_ate = false;
            } else {
                this.Set(this.head, "b");
            }
            this.head = head_target;
            head_position = $(Location2String(this.head)).offset();

            if (this.fruit[head_target[0]][head_target[1]] === 1) { // assume only 1 fruit on map
                this.fruit_gone = true;
                this.Set(this.head, "s"); // 0 empty, 1 fruit, 2 to digest
                this.just_ate = true;
                score = score + 5;
            } else {
                this.Set(this.head, "h");
            }
            this.tail_dir.push("d");
            cur_dir = "d";
            // tail
            if (this.fruit[this.tail[0]][this.tail[1]] === 2) { // tail meets fruit to digest
                this.Clear(this.tail, "f");
                this.Set(this.tail, "t");
            } else {
                let dir = this.tail_dir.shift();
                this.Clear(this.tail, "t");
                if (dir === "l") this.tail = [this.tail[0], this.tail[1] - 1];
                else if (dir === "r") this.tail = [this.tail[0], this.tail[1] + 1];
                else if (dir === "u") this.tail = [this.tail[0] - 1, this.tail[1]];
                else if (dir === "d") this.tail = [this.tail[0] + 1, this.tail[1]];
                this.Set(this.tail, "t");
            }
        }
    }

    Update() {
        if (this.game_over === false) {
            if (this.fruit_gone === true) {
                this.SpawnFruit();
                this.fruit_gone = false;
            }

            $("#score").text(score);

            if (key_pressed === "ArrowUp" || key_pressed === "w") {
                if (cur_dir === "d") {
                    this.MoveDown();
                } else {
                    this.MoveUp();
                }
            } else if (key_pressed === "ArrowDown" || key_pressed === "s") {
                if (cur_dir === "u") {
                    this.MoveUp();
                } else {
                    this.MoveDown();
                }
            } else if (key_pressed === "ArrowLeft" || key_pressed === "a") {
                if (cur_dir === "r") {
                    this.MoveRight();
                } else {
                    this.MoveLeft();
                }
            } else if (key_pressed === "ArrowRight" || key_pressed === "d") {
                if (cur_dir === "l") {
                    this.MoveLeft();
                } else {
                    this.MoveRight();
                }
            } else if (key_pressed === null) {
                this.MoveLeft();
            } else {
                if (cur_dir === "l") this.MoveLeft();
                else if (cur_dir === "r") this.MoveRight();
                else if (cur_dir === "u") this.MoveUp();
                else if (cur_dir === "d") this.MoveDown();
            }
        } else {
            clearInterval(update_interval);
            update_interval = null;
            LoadResultBoard();
        }
    }
}

function PrepareGame() {
    $("#start_button").hide();
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
    //reset crown image
    $("#crown_img_1").attr("src", "./assets/crown-gray.png");
    $("#crown_img_2").attr("src", "./assets/crown-gray.png");
    $("#crown_img_3").attr("src", "./assets/crown-gray.png");
    //reset game
    game.Reset();
    update_interval = setInterval(game.Update.bind(game), 500);
}

function main() {
    let button = AddStartButton();
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