// @ts-ignore
const socket = io();
let jogo = document.getElementById('jogo');
let simbolo = '';

socket.on('area', (areaArray, playerData) => {
    if(jogo.classList.contains('not-ready')){
        jogo.classList.remove('not-ready');
        jogo.innerHTML = "";
        simbolo = playerData[socket.id];
        init(areaArray);
    }
})

socket.on('update', (id, value) => {
    let btn = document.getElementById(id);
    btn.innerText = value;
    btn.classList.remove('not-clicked')
})

socket.on('status', status => {
    if(jogo.classList.contains('not-ready')){
        document.getElementById('status').innerText = status;
    }else{
        jogo.innerHTML = "";
        let statusElem = document.createElement('h1')
        statusElem.id = "status";
        statusElem.innerText = status;
        jogo.appendChild(statusElem);
        jogo.classList.add('not-ready');
    }
})

function init(array){
    for (let i = 0; i < array.length; i++) {
        let lista = document.createElement('div');
        lista.className = "lista";
        lista.id = "lista" + i;
        for (let j = 0; j < array[i].length; j++) {
            let button = document.createElement('button');
            button.id = i + "-" + j;
            button.classList.add('not-clicked')
            button.innerText = array[i][j];
            button.addEventListener('click', e => {
                if(button.classList.contains("not-clicked") && simbolo != "Spectator"){
                    socket.emit('click', button.id)
                    button.classList.remove('not-clicked')
                }
            })
            lista.appendChild(button);
        }
        jogo.appendChild(lista);
    }
    let gameStatusDiv = document.createElement('div');
    let gameStatusText = document.createElement('h3');

    gameStatusText.id = "ST";
    gameStatusText.innerText = `Your are ${simbolo}`;
    gameStatusDiv.id = "DT";

    gameStatusDiv.appendChild(gameStatusText);
    jogo.appendChild(gameStatusDiv);
}