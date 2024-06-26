const socket =io();

const startScreen = document.getElementById('start-screen');
const lobby = document.getElementById('lobby');
const gameBoard = document.getElementById('game-board');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const playerBoard = document.getElementById('player-board');
const opponentPlayer = document.getElementById('opponent-player');
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



