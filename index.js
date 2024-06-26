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

function createNewGame(player1,player2){
    return {
        player1: createEmptyBoard(),
        player2: createEmptyBoard(),
        turn: player1,
        history:[],
    };
}

function createEmptyBoard(){
    return Array.from({length:10},()=>Array(10).fill(null));
}

function processMove(game,move){
    const currentPlayer = game.turn;
    const opponentPlayer = currentPlayer === game.player1 ? game.player2 : game.player1;
    const board = game.turn === game.player1 ? game.player2 : game.player1;

    if(board[move.row][move.col]===ship){
        board[move.row][move.col] = 'hit';
        game.history.push({player: currentPlayer, row: move.row, col:move.col,result:'hit'});
       
    }else{
        board[move.row][move.col] = 'miss';
        game.history.push({player: currentPlayer, row: move.row, col:move.col,result:'miss'});
        game.turn = opponentPlayer;
    }

    function checkWin(board){
        return board.every(row=>row.every(cell=>cell !== 'ship'));
    }

    const PORT = process.env.PORT || 3000;
    server.listen(PORT,() =>{
         console.log('Servidor conectado al puerto ${PORT}');   
    });
}