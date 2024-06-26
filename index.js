const express = require('express');
const http = require ('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let waitingPlayer = null;
let games = {};



const users = {
    user1: 'password1',
    user2: 'password2',
};

app.use(express.static('public'));

io.on('connection', (socket)=>{
    console.log('Jugador Conectado: ', socket.id);

    socket.on('login', (data)=>{
        const {username,password} = data;

        if(users[username] && users[username] === password){
            socket.emit('loginSuccess');
        }else{
            socket.emit('loginFailure', 'Usuario o contraseña incorrecto');
        }
    });

    socket.on('joinGame',()=>{
        if(waitingPlayer){
            const gameId ='${$wainingPlayer.id}-${socket.id}';
            games[gameId] = createNewGame(waitingPlayer.id,socket.id);
            waitingPlayer.join(gameId);
            socket.join(gameId);
            io.to(gameId).emit('startGame');
            waitingPlayer = null;
        }else{
            waitingPlayer = socket;
            socket.join('waitingRoom');
        }
    });

    socket.on('makeMove',()=>{
        const gameId =Object.keys(socket.rooms).find(r=>r !== socket.id);
        const game = games[gameId];
        if(game.turn === socket.id){
            if(game.turn === socket.id){
                const result = processMove(game,move);
                io.to(gameId).emit('updateBoard', game);
                if(result = 'win' ){
                    io.to(gameId).emit('endGame',{winner:socket.id});
                    delete games[gameId];
                }
            }
        }
    });

    socket.on('sendMessage',(message)=>{
        const gameId =Object.keys(socket.rooms).find(r=>r!== socket.id);
        io.to(gameId).emit('chatMessage',message);
        // const game = games[gameId];
        // if(game.turn === socket.id){
        //     io.to(gameId).emit('newMessage',{message:message,sender:socket.id});
        // }
    })
    socket.on('disconnect', ()=>{
        console.log('Jugador Desconectado: ', socket.id);
        if(waitingPlayer === socket){
            waitingPlayer = null;
        }
    });
});