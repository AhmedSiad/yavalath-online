let socket = io();

function run() {
    socket.emit("creategame");
}

function createdgame(data) {
    window.location.href = window.location.origin + "/gameid=" + data.id;
}
socket.on("createdgame", createdgame);

