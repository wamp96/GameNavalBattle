const socket = io();

const startScreen = document.getElementById('start-screen');
const lobby = document.getElementById('lobby');
const gameBoard = document.getElementById('game-board');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const playerBoard = document.getElementById('player-board');
const opponentBoard = document.getElementById('opponent-board');
const messages = document.getElementById('messages');
const chatInput = document.getElementById('chat-input');
const turnIndicator = document.getElementById('turn-indicator');
const historyList = document.getElementById('history-list');
const resultMessage = document.getElementById('result-message');

//Audios

const hitSound = new Audio('sounds/hit.mp3');
const missSound = new Audio('sounds/miss.mp3');
const winSound = new Audio('sounds/win.mp3');
const loseSound = new Audio('sounds/lose.mp3');


loginForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;
    socket.emit('login',{username,password});
});

socket.on('loginSuccess',()=>{
    startScreen.style.display = 'none';
    lobby.style.display = 'block';
    socket.emit('joinGame');
});

socket.on('loginFailure',(message)=>{
    alert(message);
});

socket.on('startGame',()=>{
    lobby.style.display = 'none';
    gameBoard.style.display = 'block';
    setupBoards();
    turnIndicator.textContent = 'Es su turno';
});

socket.on('chatMessage',(message)=>{
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
});

chatInput.addEventListener('keypress',(event)=>{
    if(event.key === 'Enter' && chatInput.value){
        socket.emit('sendMessage', chatInput.value);
        chatInput.value = '';
    }
});


function setupBoards(){
    createBoard(playerBoard,'player');
    createBoard(opponentBoard,'opponent');
}

function createBoard(boardElement, type){
    for(let i = 0; i<10;i++){
        for(let j = 0; j<10;j++){
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if(type === 'opponent'){
                cell.addEventListener('click',()=>{
                    socket.emit('makeMove',{row:i,col:j});
                });
            }
            boardElement.appendChild(cell);
        }
    }
}


socket.on('updateBoard',(board)=>{
    updateBoard(playerBoard,board.player);
    updateBoard(opponentBoard,board.opponent);
    updateTurnIndicator(board.turn);
    updateMoveHistory(board.history);
});


socket.on('gameOver',(result)=>{
    resultMessage.style.display = 'block';
    resultMessage.textContent = result.winner === socket.id ? '!GANASTE¡':'!PERDIO¡';
    turnIndicator.style.display = 'none';

    if(result.winner === socket.id){
        winSound.play();
    }else{
        loseSound.play();
    }

});


function updateBoard(boardElement,boardData){
    const cells = boardElement.getElementByClassName('cell');
    for(let i = 0; i < cells.length; i++){
        const cell = cells[i];
        const row = Math.floor(i/10);
        const col = i % 10;
        cell.className = 'cell';
        if(boardData[row][col]==='ship'){
            cell.classList.add('ship');
        }else if(boardData[row][col]==='hit'){
            cell.classList.add('hit');
            hitSound.play();
        }else if(boardData[row][col]==='miss'){
            cell.classList.add('miss');
            missSound.play();
        }
    }
}

function updateTurnIndicator(turn){
    turnIndicator.textContent = turn === socket.id ? 'Es tu turno ' : 'Turno del oponente'
}

function updateMoveHistory(history){
    historyList.innerHTML = '';
    history.forEach(move =>{
        const listItem = document.createElement('li');
        listItem.textContent = `${move.player === socket.id ? 'Tu': 'Oponente'} ataco(${move.row},${move.col})`;
        historyList.appendChild(listItem);
    });
}
