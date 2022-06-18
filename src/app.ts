import * as express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import * as path from 'path';

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 3000;

app.use(express.static(path.resolve('public')));
app.use(
  '/socket',
  express.static(path.resolve('node_modules', 'socket.io', 'client-dist')),
);

server.listen(PORT, () => {
  console.log(`Server started at: http://localhost:${PORT}`);
});

// ////////////////////////////////////////////////////////////////////////////////////////////
type Symbol = 'X' | 'O';
type AreaSymbol = Symbol | ' ';
type PlayerSymbol = Symbol | 'Spectator';
// type AllSymbols = AreaSymbol | PlayerSymbol;

const game: {
  area: Array<AreaSymbol[]>;
  turn: Symbol;
} = {
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

let players: { id: string; symbol: PlayerSymbol }[] = [];

function addPlayer(id: string, value: PlayerSymbol) {
  console.log(`Player ${id}, Symbol: ${value} connected.`);
  players.push({ id, symbol: value });
}

function getSymbol(defaultSymbol: PlayerSymbol): PlayerSymbol {
  console.log(players);
  if (players.length < 1) return 'X';
  if (players.length < 2) {
    if (players.find((e) => e.symbol === 'O')) return 'X';
    if (players.find((e) => e.symbol === 'X')) return 'O';
  }

  return defaultSymbol;
}

function setInArea(areaPosition: [number, number], symbol: PlayerSymbol) {
  const correctSymbol = symbol === 'Spectator' ? ' ' : symbol;
  game.area[areaPosition[0]][areaPosition[1]] = correctSymbol;
}

function deletePlayer(id: string) {
  players = players.filter((e) => e.id !== id);
}

function updatePlayers() {
  function applyInFirstSpecter(symbol: Symbol) {
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
  } else {
    io.emit('area', game.area);
  }

  console.log('Connections: ', Object.keys(players).length);

  socket.on('click', (areaPosition: [number, number]) => {
    const player = players.find((e) => e.id === socket.id);

    if (player.symbol !== game.turn) return;

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
