const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
// @ts-ignore
const { Server } = require('socket.io');
const io = new Server(server);
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../', 'public')));

server.listen(PORT, () => {
    console.clear();
    console.log(`Server started at: http://localhost:${PORT}`);
})

//////////////////////////////////////////////////////////////////////////////////////////////
let vez = false; //true O, false X
let size = 3;
let area = [...Array(size)].map(e => new Array(size).fill(''));
let status = {NeedPlayers: "Waiting for more players...", PlayerExit:"Player Exit, Waiting for more players..."}
let players = {}

io.on('connection', socket => {
    console.log('Player connected');
    
    addPlayer(socket.id, getValue());

    if(Object.keys(players).length < 2) socket.emit('status', status.NeedPlayers); else io.emit('area', area, players);

    socket.on('click', btnId => {
        let clickId = btnId.split('-');
        appliedInArea(clickId, players[socket.id]);
        io.emit('update', btnId, players[socket.id])
        // console.log(area);
        console.log(clickId);
    })
    
    socket.on('disconnect', () => {
        area.map(e => e.fill(''))
        delete players[socket.id];
        if(Object.keys(players).length < 2) {
            updatePlayers();
            io.emit('status', status.PlayerExit);
        }
    })

    for (player in players){
        console.log(`Player ${player}, Symbol: ${players[player]} connected.`);
    }
    
})

function getValue(){
    let i = 0;
    for(let _id in players) i++;
    
    return i < 1 ? 'O' : i < 2 ? 'X' : 'Spectator';
}

function appliedInArea(areaPosition, simbolo){
    area[areaPosition[0]][areaPosition[1]] = simbolo;
}

function updatePlayers(){
    let i = 0;
    for(let _id in players);
        i++;

    let index = 0;
    for(let id in players){
        if(index == 0) players[id] = "O"; else if(index == 1) players[id] = "X"; else players[id] = "Spectator";
        index++;
    }
}

function addPlayer(id, value){
    players[id] = value.toString();
}