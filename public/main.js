const socket = io();
let container = document.getElementById("container");
let symbol;

socket.on("area", (areaArray) => {
  container.innerHTML = "";
  init(areaArray);
});

socket.on("settings", (newSymbol) => {
  if (symbol === 'Spectator' && newSymbol !== 'Spectator') {
    const allInputs = document.getElementById('container').querySelectorAll('input');

    allInputs.forEach((e) => e.disabled = false);
  }
  symbol = newSymbol;

  const symbolSpan = document.querySelector('span#your-symbol');
  if (symbolSpan) symbolSpan.innerHTML = newSymbol;
});

socket.on("update", (id, value) => {
  let btn = document.getElementById(id.join('-'));
  btn.disabled = true;
  btn.value = value;
});

socket.on("status", (status) => {
  const divStatus = document.getElementById('status');
  if (divStatus) {
    divStatus.innerText = status;
  } else {
    const newStatus = document.createElement('h1');
    container.innerHTML = '';
    newStatus.id = 'status';
    newStatus.innerText = status;
    container.appendChild(newStatus);
  }
});

function init(array) {
  const spectator = symbol === 'Spectator';

  container.innerHTML += `<h3 id="alerts"></h3>`;
  for (let column = 0; column < array.length; column++) {
    let lista = document.createElement("div");
    lista.className = "lista";
    lista.id = "lista" + column;
    for (let line = 0; line < array[column].length; line++) {
      let button = document.createElement("input");
      button.type = 'button';
      button.disabled = spectator;
      button.id = column + "-" + line;
      button.value = array[column][line];
      button.addEventListener("click", (_) => {
        socket.emit('click', button.id.split('-'));
      });
      lista.appendChild(button);
    }
    container.appendChild(lista);
  }
  const gameStatusDiv = document.createElement("div");
  const gameStatusText = document.createElement("h3");

  gameStatusText.innerHTML = `Your are <span id='your-symbol'>${symbol}</span>`;
  gameStatusDiv.id = "messages";

  gameStatusDiv.appendChild(gameStatusText);
  container.appendChild(gameStatusDiv);
}
