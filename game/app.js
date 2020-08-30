let tile;
let tile2;
let grid;

let socket;

let game;

let rules = `Two players, White and Black, take turns adding a piece of their colour to an empty cell. A player wins by making 4-in-a-row of their colour (or more) but loses by making 3-in-a-row of their colour without also making 4-in-a-row (or more). If the board fills without either player winning or losing, then the game is a draw.`;

let myColor;
let myTurn = false;
let myWins = 0;
let opponentWins = 0;

let recievedRematchRequest = false;

function setup() {
    let cnv = createCanvas(1100, 700);
    cnv.parent("canvas");
    game = new Game(5, 40, width / 2, height / 2);

    socket = io();
    socket.on("showUrl", showUrl);
    socket.on("setup", initialize);
    socket.on("move", incomingMove);
    socket.on("gameover", gameover);
    socket.on("rematchRequested", rematchRequested);
    socket.on("rematchAccepted", startRematch);
    socket.on("opponentDisconnected", opponentDisconnected);
}

function draw() {
    background(240, 244, 249);

    let tileHovered;
    if (myTurn) {
        tileHovered = game.findClosestTile(mouseX, mouseY);
    }

    for (let row of game.grid) {
        for (let tile of row) {
            if (game.winningTiles.includes(tile) == false) {
                if (tile == tileHovered) tile.drawHovered();
                else if (tile == game.mostRecentTile) tile.drawMostRecent();
                else tile.draw();
            }
        }
    }

    for (let winTile of game.winningTiles) {
        winTile.draw();
    }

    let turnText = (myTurn ? "Your Turn" : "Opponent's Turn");
    if (myColor == undefined) turnText = "";

    push();
    textSize(32);
    textFont("Fredoka One");
    textAlign(CENTER, CENTER);
    text(turnText, width/2, 50);

    rectMode(CENTER);
    fill(36, 166, 215);
    rect(width/2, height - 40, 200, 40);

    if (myColor == "black") fill(0);
    else fill(255);
    text(myWins, width/2 - 20, height - 40);

    fill(76, 206, 255);
    text("-", width/2, height - 40);

    if (myColor == "black") fill(255);
    else fill(0);
    text(opponentWins, width/2 + 20, height - 40);
    pop();
}

function opponentDisconnected() {
    $('#disconnectBox').css({ opacity: 0, visibility: "visible" }).animate({ opacity: 1 });
    $('#winBox').css({ opacity: 1, visibility: "hidden" }).animate({ opacity: 0 });

    myTurn = false;
}

function showUrl() {
    $('#urlBox').css({ opacity: 0, visibility: "visible" }).animate({ opacity: 1 });
    document.getElementById("urlLink").value = window.location.href;
}

function startRematch() {
    game = new Game(5, 40, width / 2, height / 2);
    myColor = (myColor == "black" ? "white" : "black");
    if (myColor == "black") myTurn = true;
    else myTurn = false;

    $('#winBox').css({ opacity: 1.0, visibility: "hidden" }).animate({ opacity: 0 });
    recievedRematchRequest = false;

    let rematchButton = document.getElementById("rematchButton");
    rematchButton.innerHTML = "Request Rematch";
    rematchButton.disabled = false;
}

function rematch() {
    let rematchButton = document.getElementById("rematchButton");
    if (recievedRematchRequest == false) {
        rematchButton.innerHTML = "Rematch Requested";
        rematchButton.disabled = true;
        socket.emit("rematchRequested");
    }
    else {
        startRematch();

        let rematchButton = document.getElementById("rematchButton");
        rematchButton.className = rematchButton.className.replace(/\baccept\b/g, "");
        rematchButton.className += "request";

        socket.emit("rematchAccepted");
    }
}

function rematchRequested() {
    recievedRematchRequest = true;

    let rematchButton = document.getElementById("rematchButton");
    rematchButton.innerHTML = "Accept Rematch";
    rematchButton.className = rematchButton.className.replace(/\brequest\b/g, "");
    rematchButton.className += "accept";
}

function gameover(data) {
    let oppositeColor = (myColor == "black" ? "white" : "black");
    game.processMove(data.i, data.j, oppositeColor);
    let nil = game.checkWinner(data.i, data.j);

    for (let tile of game.winningTiles) {
        if (data.winner == true) tile.strokeColor = color(255, 0, 0);
        else tile.strokeColor = color(0, 255, 0);
    }

    $('#winBox').css({ opacity: 0.0, visibility: "visible" }).animate({ opacity: 1 });
    setWinLabels(!data.winner);
}

function incomingMove(data) {
    myTurn = true;
    let oppositeColor = (myColor == "black" ? "white" : "black");
    game.processMove(data.i, data.j, oppositeColor);
}

function initialize(data) {
    console.log(data);
    $('#urlBox').css({ opacity: 1, visibility: "hidden" }).animate({ opacity: 0 });

    myColor = data.color;
    if (myColor == "black") myTurn = true;
}

function mousePressed() {
    if (myTurn) {
        let tileClicked = game.findClosestTile(mouseX, mouseY);
        console.log(tileClicked)
        if (tileClicked != null) {
            game.processMove(tileClicked.indexI, tileClicked.indexJ, myColor);
            myTurn = false;

            let won = game.checkWinner(tileClicked.indexI, tileClicked.indexJ);
            if (won == null) {
                let data = { i: tileClicked.indexI, j: tileClicked.indexJ };
                socket.emit("move", data);
            }
            else {
                let data = {
                    i: tileClicked.indexI,
                    j: tileClicked.indexJ,
                    winner: won
                };

                for (let tile of game.winningTiles) {
                    if (won == true) tile.strokeColor = color(0, 255, 0);
                    else tile.strokeColor = color(255, 0, 0);
                }

                $('#winBox').css({ opacity: 0.0, visibility: "visible" }).animate({ opacity: 1 });
                setWinLabels(won);

                socket.emit("gameover", data);
            }
        }
    }
}

function setWinLabels(won) {
    let winText = document.getElementById("winText");
    let winDescription = document.getElementById("winDescription");

    if (won == true) {
        winText.innerHTML = "You Won!";
        myWins++;

        if (game.winningTiles[0].color == myColor) {
            winDescription.innerHTML = "You made four in a row.";
        } else {
            winDescription.innerHTML = "Your opponent made three in a row.";
        }
    }
    else {
        winText.innerHTML = "You Lost.";
        opponentWins++;

        if (game.winningTiles[0].color == myColor) {
            winDescription.innerHTML = "You made three in a row.";
        } else {
            winDescription.innerHTML = "Your opponent made four in a row.";
        }
    }
}

function createHeaders() {
    let nameHeader = document.createElement("h1");
    nameHeader.innerHTML = "Yavalath, by Ludi";
}

function createRules() {
    let span = document.createElement("span");
    span.innerHTML = `Two players, White and Black, take turns adding a piece of their colour to an empty cell. 
    A player wins by making 4-in-a-row of their colour (or more) 
    but loses by making 3-in-a-row of their colour without also making 4-in-a-row (or more). 
    If the board fills without either player winning or losing, then the game is a draw.`;

    span.style.display = "inline-flex";
    span.style.textAlign = "center";
    span.style.width = "20em";
    span.style.position = "absolute";
    span.style.top = "2em";
    span.style.left = "3em";

    document.body.appendChild(span);
}

function polygon(x, y, radius, npoints) {
    let angle = Math.PI * 2 / npoints;
    beginShape();
    for (let a = 0; a < Math.PI * 2; a += angle) {
        let sx = x + Math.cos(a) * radius;
        let sy = y + Math.sin(a) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

