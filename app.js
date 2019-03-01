//app.js

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

//serv.listen(2000);
serv.listen(process.env.PORT || 2000);

console.log("Server started.");

var socketList = {};
var playerList = {};
var roomList = {};

//Player..
Player = function (id, username){
	
	var plyr  = {
		
		id:id,
		username:username,
		roomid : '',
		index : 0,
		type : 0,
		winCount : 0,
		isReady:false,
		isReadyForRematch : false,
		piecesRevealed : false,
		pieces : {}
	}

	plyr.score = function () {

		plyr.winCount += 1;

		console.log ( '\n --> Game Winner : ', plyr.username, plyr.winCount );
		
	}

	plyr.gameResetData = function () {

		plyr.isReady = false;
		plyr.isReadyForRematch = false;
		plyr.piecesRevealed = false;
		plyr.pieces = {};
	}
	
	plyr.gameReset = function () {

		plyr.gameResetData();
		
		plyr.type = plyr.type == 0 ? 1 : 0;

	}
 	
	plyr.resetAll = function () {
		
		plyr.gameResetData();
		
		plyr.index = 0;
		plyr.type = 0;
		plyr.winCount = 0;
		plyr.roomid = '';

	}

	return plyr;

}

//Rooms..
GameRoom = function ( id, isTimed=false, prepTime = 30, blitzTime = 15 ) {
	
	var rm = {

		id : id,
		prepTime : prepTime,
		blitzTime : blitzTime,
		turn : 0,
		initialTurn : 0,
		counter : 0,
		isWinner : '',
		isWinning : '',
		playerCount : 0,
		isClosed : false,
		isTimed : isTimed,
		isTicking : false,
		isGameOn : false,
		timer : null,
		phase : '',
		playerIDs : [],
		gridData : []

	}

	rm.getPlayersPieceData = function () {
		//..
	}
	rm.getWinner = function () {
		
		var opp = rm.turn == 0 ? 1 : 0;

		var plyr = playerList [ rm.playerIDs [opp] ];

		plyr.score();

	}
	rm.stopTimer = function () {
		
		clearInterval( rm.timer );

		rm.isTicking = false;
	}
	rm.startTimer = function ( max ) {
		//..

		rm.isTicking = true;

		//clearInterval ( rm.timer );

		rm.timer = setInterval ( function () {

			rm.counter += 1;
			
			console.log ( max - rm.counter );
			
			if ( rm.counter >= max) {
				
				rm.stopTimer ();

				if ( rm.phase == 'prep' ) {

					rm.getPlayersPieceData ();
				}
				else if ( rm.phase == 'commence' ) {

					rm.startGame ();
				}
				else if ( rm.phase == 'proper' ) {

					rm.endGame ();

					rm.getWinner ();
				}
				
			}

		}, 1000 );
		
	}
	rm.createGrid = function () {

		rm.gridData = [];

		for ( var i = 0; i< 72; i++ ) {

			var r = Math.floor ( i/9 ), c = i % 9;

			rm.gridData.push ({
				'row' : r,
				'col' : c,
				'resident' : '',
                'residentPlayer' : ''
			});

		}

	}
	rm.initGame  = function () {

		console.log ('\n --> Game is initialized', rm.id );

		rm.phase = 'prep';
		
		rm.isGameOn = true;

		rm.isClosed = true;

		rm.createGrid ();

		rm.turn = rm.initialTurn;
		
		rm.counter = 0;

		if ( rm.isTimed ) rm.startTimer( rm.prepTime );

	}
	rm.commence = function () {

		console.log ('\n --> Game is commencing', rm.id );

		rm.phase = 'commence';
		
		if ( rm.isTicking ) rm.stopTimer ();

		rm.counter = 0;

		rm.startTimer( 3 );

	}
	rm.startGame  = function () {
		//..

		console.log ('\n --> Game has started', rm.id );

		rm.phase = 'proper';

		if ( rm.isTicking ) rm.stopTimer ();

		rm.counter = 0;

		if ( rm.isTimed ) rm.startTimer( rm.blitzTime );

	}
	rm.endGame = function () {

		console.log ('\n --> Game has ended', rm.id );

		rm.isGameOn = false;

		if (rm.isTicking) rm.stopTimer ();

	}
	rm.resetGame = function () {

		console.log ('\n --> Game has restarted', rm.id );

		rm.initialTurn = rm.initialTurn == 0 ? 1 : 0;

		rm.turn = rm.initialTurn;

		rm.phase = 'prep';
		
		rm.isGameOn = true;

		rm.counter = 0;
		
		rm.isWinning = '';

		rm.createGrid ();

		if ( rm.isTimed ) rm.startTimer( rm.prepTime );

	}
	rm.switchTurn = function () {

		console.log ('\n --> Game is switching turn', rm.id );

		rm.turn = rm.turn == 0 ? 1 : 0;

		var playerid = rm.playerIDs [rm.turn];

		if ( rm.isWinning != '' &&  rm.isWinning == playerid ) {

			console.log ( '\n --> Winner', playerList [ playerid ].username );

			rm.endGame ();

			playerList [ playerid ].score();

		} else {

			if (rm.isTicking) rm.stopTimer ();

			rm.counter = 0;

			if ( rm.isTimed ) rm.startTimer ( rm.blitzTime );
		}

	}

	return rm;
	
}

io.on('connection', function(socket){
	
	socketList[socket.id] = socket;
	
	socket.on("initUser", function (data) {
		
		var newPlayer = Player ( socket.id, data );

		playerList [ socket.id ] = newPlayer;

		console.log ( '\n --> ' + newPlayer.username  + ' has entered the game.' );

		sendPlayersOnline ();
		
	});

	socket.on ('getPlayersOnline', function () {
		
		var playersCount = Object.keys(socketList).length;

		socket.emit ( 'playersOnline', playersCount );
		
	});
	
	socket.on("enterGame", function (data) {
	
		var player = playerList [ socket.id ];


		if ( data.isSinglePlayer ) {

			var newRoomID = player.username + '_' + Date.now();

			var newRoom = GameRoom ( newRoomID, data.isTimed );
				
			newRoom.playerIDs.push ( socket.id )

			newRoom.isClosed = true;

			roomList [ newRoomID ] = newRoom;

			player.roomid = newRoomID;

			var returnData = {
			
				'isSinglePlayer' : true,
				'isTimed' : newRoom.isTimed,
				'blitzTime' : newRoom.blitzTime,
				'prepTime' : newRoom.prepTime,
				'players' : {
					'self' : {
						'name' : player.username,
						'type' : 0,
					}
				}
			};

			socket.emit ('initGame', returnData ); 

			console.log ( '\n --> Room Created :', newRoom.id );


		}else {
	
			var availableRoom = getAvailableRoom( data.isTimed );

			if ( availableRoom == 'none' ) {

				var newRoomID = player.username + '_' + Date.now();
				
				var newRoom = GameRoom ( newRoomID, data.isTimed );
				
				newRoom.playerIDs.push ( socket.id );

				newRoom.playerCount += 1;

				roomList [ newRoomID ] = newRoom;

				player.roomid = newRoomID;

				console.log ( '\n --> '+ player.username +' created a room :', newRoom.id );

			}else  {
				

				player.roomid = availableRoom;

				player.index = 1;

				player.type = 1;

				var gameRoom = roomList [ availableRoom ];

				gameRoom.playerIDs.push ( socket.id );

				gameRoom.playerCount += 1;

				console.log ( '\n --> '+ player.username +' join the room :', gameRoom.id );
				
				//initialize game..
				initGame ( gameRoom.id );
		
			}

		}

			
	});

	socket.on("playerResign", function () {
		
		var plyr = playerList [ socket.id ];

		console.log ('\n --> ' + plyr.username + ' has resigned.');

		var room = roomList [ plyr.roomid ];

		room.endGame ();

		var opponent = playerList [ getOpponentsId (socket.id ) ];

		opponent.score();

		var oppoSocket = socketList [ opponent.id ];

		oppoSocket.emit ('opponentResign');

	});

	socket.on("piecesReveal", function () {

		var player = playerList [ socket.id ];

		player.piecesRevealed = true;

		console.log ('\n --> ' + player.username + ' has revealed his/her game pieces.');

		var gamePieces = getPlayerPieces ( player.id );

		var oppSocket = socketList [ getOpponentsId( socket.id) ];

		oppSocket.emit ('opponentReveal', gamePieces );

	});

	socket.on("playerReady", function (data) {
		
		var player = playerList [socket.id];
		
		initPlayerPieces ( socket.id, data );

		var checker = checkPlayersAreReady ( player.roomid );

		if ( checker ) {
			
			commenceGame ( player.roomid );

		}else {

			sendPlayerReady ( player.roomid );
		}
		
	});

	socket.on("playerOfferedADraw", function () {
		
		var player = playerList [socket.id];
		
		console.log ('\n -- > ' + player.username + ' has offered a draw' );

		var room = roomList [ player.roomid ];

		room.stopTimer ();

		var oppoSocket = socketList [ getOpponentsId(socket.id) ];

		oppoSocket.emit ('getDrawResponse');
		
	});

	socket.on("playerDrawResponse", function ( data ) {
		

		var player = playerList [socket.id];

		var room = roomList [ player.roomid ];


		if ( !data ) {

			console.log ('\n --> Game resumes..' );

			if ( room.isTimed ) room.startTimer ( room.blitzTime );

		}else {

			console.log ('\n --> Game Winner : none' );

			room.endGame ();

		}

		for ( var i in room.playerIDs ) {
			
			var plyrWhoResponded = room.playerIDs[i] == player.id ? true : false;

			var tmpSocket = socketList [ room.playerIDs[i] ];

			tmpSocket.emit ( 'drawResponse', { 'accepted' : data, 'plyrWhoResponded' : plyrWhoResponded } );

		}

	});

	socket.on("pieceClick", function ( data ) {

		if ( verifyClickSent (socket.id) ) {

			//console.log ('\n --> Piece click received from ' + playerList[socket.id].username + ':', data );
			var oppoSocket = socketList [ getOpponentsId ( socket.id ) ];

			oppoSocket.emit ( 'oppoPieceClick', data );

		}else {
			console.log ('\n --> Click received is invalid ');
		}

	});
	
	socket.on("pieceMove", function ( data ) {

		//..
		if ( verifyClickSent (socket.id) ) {

			//console.log ('\n --> Move received from ' + playerList[socket.id].username + ':', data );
			analyzeSentMove (  socket.id, data );

		}else {

			console.log ('\n --> Move received is invalid');
		}

	});

	socket.on("playerSendEmoji", function ( data ) {

		var player = playerList [ socket.id ];

		var room = roomList [ player.roomid ];

		for ( var i = 0; i < room.playerCount; i++ ) {

			var plyr =  ( room.playerIDs [i] == player.id ) ? 'self' : 'oppo';
			
			socketList [ room.playerIDs[i] ].emit ( 'showEmoji',  { 'plyr' : plyr, 'frame' : data });

		}

	});

	socket.on("rematchRequest", function () {
		
		var plyr = playerList [ socket.id ]
		
		plyr.isReadyForRematch = true;
		
		if ( bothPlayersRequestsRematch ( plyr.roomid ) ) {

			resetGame ( plyr.roomid );
		}

	});
	
	socket.on("leaveGame", function(data) {
		
		if ( playerList.hasOwnProperty(socket.id) ) {

			var plyr = playerList[socket.id];
			
			console.log ( '\n <-- ' + plyr.username +' has left the game' );

			leaveRoom ( socket.id );

		}

	});
	
	socket.on("disconnect",function () {
			
		if ( playerList.hasOwnProperty(socket.id) ) {

			var plyr = playerList[socket.id];

			console.log ( '\n <-- ' + plyr.username  + ' has been disconnected.' );

			if ( plyr.roomid != '' ) leaveRoom ( socket.id );
		
			delete playerList [socket.id];

		}

		delete socketList [socket.id];

		sendPlayersOnline();

	});

});


function getPlayerPieces ( playerid ) {

	var player = playerList [ playerid ];

	var pieces = [];

	for ( var i in player.pieces ) {
		pieces.push ({
			'cnt' : player.pieces[i].cnt,
			'rank' : player.pieces[i].rank
		});
	}

	return pieces;

}

function getAvailableRoom ( isTimed ) {

	for ( var i in roomList ) {
		if ( !roomList[i].isClosed && roomList[i].isTimed == isTimed ) return roomList[i].id;
	}
	return 'none';

}
function verifyClickSent ( socketid ) {

	var player = playerList [socketid];

	var gameRoom = roomList [ player.roomid ];

	if ( player.index != gameRoom.turn ) return false;

	return true;
}
function initGame ( roomid ) {

	var room = roomList [roomid ];

	for ( var i = 0; i < room.playerCount; i++ ) {

		var self = playerList [ room.playerIDs[i] ];

		var oppo =  playerList [ room.playerIDs[ i == 0 ? 1 : 0 ] ];

		var data = {
			
			'isSinglePlayer' : false,
			'isTimed' : room.isTimed,
			'blitzTime' : room.blitzTime,
			'prepTime' : room.prepTime,
			'players' : {
				'self' : {
					'name' : self.username,
					'type' : self.type,
				},
				'oppo' : {
					'name' : oppo.username,
					'type' : oppo.type
				}
			}

		};

		var socket = socketList [ self.id ];

		socket.emit ('initGame', data );

	}

	room.initGame();

}
function checkPlayersAreReady ( roomID ) {

	var gameRoom = roomList [roomID];

	for ( var i = 0; i < gameRoom.playerCount; i++ ) {

		var player = playerList [  gameRoom.playerIDs[i] ];

		if ( !player.isReady ) return false;
	}

	return true;

}
function bothPlayersRequestsRematch ( roomID ) {

	var gameRoom = roomList [roomID];

	for ( var i = 0; i < gameRoom.playerCount; i++ ) {

		var player = playerList [ gameRoom.playerIDs[i] ];

		if ( !player.isReadyForRematch ) return false;
	}

	return true;

}
function sendPlayerReady ( roomID ) {

	var gameRoom = roomList[roomID];

	for ( var i=0; i<gameRoom.playerCount; i++) {

		var self = playerList [ gameRoom.playerIDs[i] ];

		var oppo  = playerList [ gameRoom.playerIDs[ i==0 ? 1 : 0] ];

		var returnData = {
			'self' : self.isReady,
			'oppo' : oppo.isReady
		}

		var socket = socketList [ self.id ];

		socket.emit ('onePlayerReady', returnData );
	}

}
function sendPlayersOnline () {
	
	var playersCount = Object.keys(socketList).length;

	for ( var i in socketList ) {
		
		var socket = socketList [i]; 

		socket.emit ( 'playersOnline', playersCount );

	}
}
function commenceGame ( roomID ) {

	var gameRoom = roomList[roomID];	

	gameRoom.commence();

	for ( var i=0; i<gameRoom.playerCount; i++) {

		var oppo = playerList [ gameRoom.playerIDs[ i == 0 ? 1 : 0 ] ];

		var turn  = ( i == gameRoom.turn ) ? 'self' : 'oppo';

		var oppoData = [];

		for ( var j in oppo.pieces ) {

			var post = oppo.index == 0 ? Math.abs ( oppo.pieces[j].post - 71 ) : oppo.pieces[j].post;

			oppoData.push ( {
				'post' : post,
				//'rank' : oppo.pieces[j].rank,
				'rank' : -1,
				'cnt' : oppo.pieces[j].cnt
			});

		}

		var data = {
			'turn' : turn,
			'oppoData' : oppoData,
		}

		var socket = socketList [ gameRoom.playerIDs[i] ];

		socket.emit ('commenceGame',  data );

	}

	

} 
function resetGame ( roomID ) {

	var gameRoom = roomList[roomID];

	for ( var i=0; i<gameRoom.playerCount; i++) {

		var player = playerList [ gameRoom.playerIDs[i] ];

		player.gameReset ();
		
		var socket = socketList [ gameRoom.playerIDs[i] ];

		socket.emit ('resetGame');
	}

	gameRoom.resetGame();

} 
function leaveRoom ( playerid ) {
	
	var player = playerList [playerid];

	var gameRoom = roomList [ player.roomid ];
		
	var oppoID = getOpponentsId ( playerid );

	if ( gameRoom.playerCount >= 2 ) {

		if ( gameRoom.isGameOn ) gameRoom.endGame ();

		gameRoom.playerIDs.splice ( player.index, 1 );

		gameRoom.playerCount = 1;

		var oppSocket = socketList [ oppoID ];
		
		oppSocket.emit ('opponentLeft', [] );
		
	} else {
		//...
		delete roomList [ player.roomid ];

		console.log ( '\n <-- Room deleted :', gameRoom.id  );

	}
	

	player.resetAll ();
	
}
function initPlayerPieces ( playerid, piecesData ) {

	var player = playerList [ playerid ];
		
	player.isReady = true;

	var room = roomList [ player.roomid ];

	player.pieces = {};

	for ( var i in piecesData ) {

		var post = ( player.index == 0 )? piecesData[i].post : Math.abs ( piecesData[i].post - 71);

		var piece = {
			'post' : post,
			'cnt' : piecesData[i].cnt,
			'rank' : piecesData[i].rank,
			'origin' : player.index,
			'isDestroyed' : false
		};

		var pieceid = 'piece' + piecesData[i].cnt;

		player.pieces [ pieceid ] = piece;

		room.gridData[post].residentPlayer = playerid;

		room.gridData[post].resident = pieceid; 

	}	

}
function getWinner ( rankA, rankB ) {

	if ( rankA == 14 && rankB != 14 ) {  // A = Flag, B = Any except flag
		return 2; 
	}
	if ( rankB == 14 && rankA != 14 ) {  // B = Flag, A = Any except flag
		return 1; 
	}
	if ( rankA == 14 && rankB == 14 ) {  // A = Flag attacks B = Flag  -> winner : A
		return 1; 
	}
	if ( rankB == 14 && rankA == 14 ) {  // B = Flag attacks A = Flag  -> winner : B
		return 2; 
	}
	if ( rankA == 15 && rankB == 15 ) { // A = Spy, B = Spy -> no winner
		return 0;
	}
	if ( rankA == 15 && rankB != 13 ) { // A = Spy, B != Private -> winner : A
		return 1; 
	}
	if ( rankB == 15 && rankA != 13 ) { // B = Spy, A != Private -> winner : B
		return 2; 
	}
	if ( rankA == 15 && rankB == 13 ) { // A = Spy, B == Private -> winner : B
		return 2; 
	}
	if ( rankB == 15 && rankA == 13 ) { // B = Spy, A == Private -> winner : A
		return 1; 
	}
	if ( rankA < rankB ) {
		return 1;
	}
	if ( rankB < rankA ) {
		return 2;
	}
	if ( rankB == rankA ) {
		return 0;
	}

}
function analyzeSentMove ( playerid, data ) {
	
	var plyr = playerList[playerid];

	var plyrPiece = plyr.pieces [ 'piece' + data.piece ];

	var oppo = playerList [ getOpponentsId ( playerid ) ];

	var room = roomList[ plyr.roomid ];

	//get real position based on player's index or position..
	var post = plyr.index == 0 ? data.post : Math.abs ( data.post - 71 );
	
	//destination of the moving piece..
	var destPost = room.gridData [post];

	//origin position of the moving piece..
	var origPost = room.gridData [ plyrPiece.post ];
	
	origPost.resident = '';

	origPost.residentPlayer = '';

	//initialize variables needed for checking..
	var win = false, clashResult = -1;

	if ( destPost.resident != '' && destPost.residentPlayer != plyr.id ) {

		var oppoPiece = oppo.pieces [ destPost.resident ];

		clashResult = getWinner ( plyrPiece.rank, oppoPiece.rank );

		switch ( clashResult ) {

			case 0 :

				plyrPiece.isDestroyed = true;
				oppoPiece.isDestroyed = true;

				destPost.resident = '';
				destPost.residentPlayer = '';
			
			break;

			case 1 :

				plyrPiece.post = post;

				destPost.resident = 'piece' + data.piece;
				destPost.residentPlayer = plyr.id;

				oppoPiece.isDestroyed = true;

				if ( oppoPiece.rank == 14 ) {
					
					win = true;
		
					room.endGame ();

					plyr.score();

					//console.log ( '\n --> Winner :', plyr.username );

				}

			break;
			case 2 :

				plyrPiece.isDestroyed = true;

				if ( plyrPiece.rank == 14 ) {
					
					win = true;

					room.endGame ();

					oppo.score();

					//console.log ( '\n --> Winner :', oppo.username );
				}

			break;
			default : 
				//..
			
		}

	}else {

		plyrPiece.post = post;

		destPost.resident = 'piece' + data.piece;
		destPost.residentPlayer = plyr.id;

		if (( plyrPiece.rank == 14 && plyrPiece.origin == 0 && destPost.row == 0 ) || ( plyrPiece.rank == 14 && plyrPiece.origin == 1 && destPost.row == 7 ) ) {
			
			var sorrounded = oppoNearby ( plyrPiece.post, plyr.id, room.id );

			if ( sorrounded ) {

				room.isWinning = plyr.id;

				console.log ( '\n --> Is Winning :', plyr.username );

			}else {
				
				room.endGame ();

				plyr.score();

				win = true;

				//console.log ( '\n --> Hit Base :', plyr.username );

			}

		}


	}

	if ( !win ) room.switchTurn ();

	
	for ( var i = 0; i < room.playerCount; i++) {
		
		var self = playerList [ room.playerIDs[i] ];

		var oppo = playerList [ room.playerIDs[ i == 0 ? 1 : 0 ] ];

		var toReturnPost = self.id == playerid ? data.post : Math.abs ( data.post - 71 );

		var isWinning = '';

		if ( room.isWinning != '' ) {
			isWinning = self.id == room.isWinning ? 'self' : 'oppo';
		}

		var oppoPieces = [];

		if ( win || room.isWinning != '' ) {

			if ( !oppo.piecesRevealed ) oppoPieces = getPlayerPieces ( oppo.id );

		}

		var returnData = {
			'win' : win,
			'oppoPieces' : oppoPieces,
			'isWinning' : isWinning,
			'post' : toReturnPost,
			'clashResult' : clashResult

		}

		//console.log ( ' --> Data sent to ', self.username );
		
		var socket = socketList [ self.id ];

		socket.emit ( 'moveResult',  returnData ); 
		
	}
	

	
}
function getOpponentsId ( playerid ) {
	
	var plyr = playerList[playerid];
	
	if ( plyr.roomid != '' ) {
		
		var oppIndex = ( plyr.index == 0 ) ? 1 : 0;
		
		return roomList[ plyr.roomid ].playerIDs[ oppIndex ];
	}

	return '';

}
function oppoNearby ( post, playerid, roomid ) {

	var myGrid = roomList [roomid].gridData;

	var left = post - 1;
	if ( left >= 0 && myGrid[left].row == myGrid[post].row && myGrid[left].resident != '' && myGrid[left].residentPlayer != playerid ){
		return true;
	}

	var right = post + 1;
	if ( right < 72  && myGrid[right].row == myGrid[post].row && myGrid[right].resident != '' && myGrid[right].residentPlayer != playerid ){
		return true;
	}

	var top = post - 9;
	if ( top >= 0 && myGrid[top].row == myGrid[post].row && myGrid[top].resident != '' && myGrid[top].residentPlayer != playerid ){
		return true;
	}

	var bot = post + 9;
	if ( bot < 72 && myGrid[bot].row == myGrid[post].row && myGrid[bot].resident != '' && myGrid[bot].residentPlayer != playerid ){
		return true;
	}
	return false;

}
//............

