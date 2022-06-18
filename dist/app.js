"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const path = require("path");
const app = express();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server);
const PORT = 3000;
app.use(express.static(path.resolve('public')));
app.use('/socket', express.static(path.resolve('node_modules', 'socket.io', 'client-dist')));
server.listen(PORT, () => {
    console.log(`Server started at: http://localhost:${PORT}`);
});
// type AllSymbols = AreaSymbol | PlayerSymbol;
const game = {
    area: [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' '],
    ],
    turn: 'X',
};
const status = {
    NeedPlayers: 'Waiting for more players...',
    PlayerExit: 'Player Exit, Waiting for more players...',
};
let players = [];
function addPlayer(id, value) {
    console.log(`Player ${id}, Symbol: ${value} connected.`);
    players.push({ id, symbol: value });
}
function getSymbol(defaultSymbol) {
    console.log(players);
    if (players.length < 1)
        return 'X';
    if (players.length < 2) {
        if (players.find((e) => e.symbol === 'O'))
            return 'X';
        if (players.find((e) => e.symbol === 'X'))
            return 'O';
    }
    return defaultSymbol;
}
function setInArea(areaPosition, symbol) {
    const correctSymbol = symbol === 'Spectator' ? ' ' : symbol;
    game.area[areaPosition[0]][areaPosition[1]] = correctSymbol;
}
function deletePlayer(id) {
    players = players.filter((e) => e.id !== id);
}
function updatePlayers() {
    function applyInFirstSpecter(symbol) {
        for (const index in players) {
            const player = players[index];
            if (player.symbol === 'Spectator') {
                players[index].symbol = symbol;
                break;
            }
        }
    }
    if (players.find((e) => e.symbol === 'O')) {
        applyInFirstSpecter('X');
    }
    if (players.find((e) => e.symbol === 'X')) {
        applyInFirstSpecter('O');
    }
}
io.on('connection', (socket) => {
    addPlayer(socket.id, getSymbol('Spectator'));
    socket.emit('settings', players.find((e) => e.id === socket.id).symbol);
    if (players.length < 2) {
        io.emit('status', status.NeedPlayers);
    }
    else {
        io.emit('area', game.area);
    }
    console.log('Connections: ', Object.keys(players).length);
    socket.on('click', (areaPosition) => {
        const player = players.find((e) => e.id === socket.id);
        if (player.symbol !== game.turn)
            return;
        setInArea(areaPosition, player.symbol);
        io.emit('update', areaPosition, player.symbol);
        game.turn = game.turn === 'X' ? 'O' : 'X';
        console.log(areaPosition);
    });
    socket.on('disconnect', () => {
        game.area.forEach((e) => e.fill(' '));
        deletePlayer(socket.id);
        updatePlayers();
        players.forEach((e) => {
            io.to(e.id).emit('settings', e.symbol);
        });
        if (Object.keys(players).length < 2) {
            io.emit('status', status.PlayerExit);
        }
    });
});
