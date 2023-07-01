/*
socket.emit 			 ---> Respond To Self
socket.broadcast.emit	 ---> Respond To Other Player But Not Self (Ecept self Player)   [
																							n = no of player,
																							socket.broadcast.emit = n-1 (Remove Self Player)
																						 ]
io.emit					 ---> Respond To All User In Soket 
*/

//*****************Config*************************************//
var app = require('express')();
var server = require('http').Server(app);

const io = require('socket.io')(server);
var shortid = require('shortid');
server.listen(3033);


console.log('BaseBall server started');
app.get('/checked', function(req, res) {
	res.send('BaseBall says hey you got back get "/"');
	console.log('--- Url Call ...');
});
//*****************Config End*************************************//


/////////////////////////////////START/////////////////////////////

//-----------Data Member End----------
var numClients = 0;
var players = [];
io.set("transports", ["websocket"]); // To make Connection Faster
var refreshIntervalId;
//-----------Data Member End----------

// Call On Each Player Connected
io.on('connection', (socket) => {
	console.log('client Connected');
	numClients++;
	console.log('No Of users:', numClients);
	
	///////////////////////////////////////////////Call Only Once At Any Player Connected //////////////////////////////////////////////////////////////////////////


	  var thisPlayerId = shortid.generate();// Unique Id Genrate For Player
	  var player = {
		id: thisPlayerId,
		name: "Loading...",
		x:0, 
		y:0
	  }

	  players[thisPlayerId] = player;
	  console.log('client conencted id:', thisPlayerId);
	  console.log('client conencted Name:', players[thisPlayerId].name);
	  
	  
	  // Send status of register|spawn|requestPosition to client
	  socket.emit('register', { id: thisPlayerId,name: player.name});
	  socket.broadcast.emit('spawn', { id: thisPlayerId,name: player.name});			// My Self Player Id Send to me 
	  socket.broadcast.emit('requestPosition' ); 

	  //Other players who connected lately can see other players who connected before For Set Starting Posision Of player Only Once Calls
	  //This Call All Player That New Player Enter In Game And Appear to all player Screen At Sending Posision.
	  for(var playerId in players){
		if (playerId == thisPlayerId)								// Not sending If Self User [Starting postion not required for self user]
		  continue;

		
		socket.emit('spawn', players[playerId]);					// Send Other Player Starting Posision Details To all
		console.log('After-----> :', players[playerId]);
		console.log('sending spawn to new player for id :', playerId);
	  }
 
 
 
 
						//////////////////////////////AI BALL THROW//////////////////////////////////
							// Count Down Fier 
							if(numClients == 2)
							{
								io.emit('countdown');
								//socket.emit('countdown');
								//socket.broadcast.emit('countdown');
							}	
								
								
								
											function Throw()
											{
											  if(numClients == 2)//  --> Both Client Is connected then Throw
											  {
												  var RandScore=Math.floor(Math.random() * Math.floor(2));
												  var RandBall=Math.floor(Math.random() * Math.floor(6));
												  console.log('Throw----->Ball Score Val:'+RandScore);
												  
												  io.emit('throw', { id: thisPlayerId,score: RandScore+"",randball: RandBall+""});
												  //socket.emit('throw', { id: thisPlayerId,score: RandScore+"",randball: RandBall+""});		
												  //socket.broadcast.emit('throw', { id: thisPlayerId,score: RandScore+"",randball: RandBall+""});		
											  }	  
											}
											
											//console.log('numClients----->Throw Ball :',numClients);
											if(numClients == 2)
												refreshIntervalId=setInterval(Throw, 8*1000);
						//////////////////////////////AI BALL THROW END//////////////////////////////////
 
 
 
 
 ///////////////////////////////////////////////Call Only Once At Any Player Connected //////////////////////////////////////////////////////////////////////////
 
 
 
 
 
 
 
 
 
 
 
 
 //-------------------------------------------Call Api By At Event Calling Time [self_move_pos/updatePosition/follow]-------------------------------------------

 


// API MOVE -> Self movement call
  socket.on('self_hit', (data) => {
    data.id = thisPlayerId;
	data.name = players[thisPlayerId].name;
   

	console.log('Player Hit', JSON.stringify(data));
    socket.emit('hit_for_self', data); // self_Hit Pass
    socket.broadcast.emit('hit_for_all', data); // self_Hit Pass  recived is sended to all other User with broadcast
  });
 
// API MOVE -> Self movement call
  socket.on('ball_in_contact', (data) => {
    data.id = thisPlayerId;
	data.name = players[thisPlayerId].name;
   

	console.log('ball_in_contact', JSON.stringify(data));
    socket.broadcast.emit('ball_in_contact_to_all', data); // self_Hit Pass  recived is sended to all other User with broadcast
  });
 

// API MOVE -> Self movement call
  socket.on('score', (data) => {
    data.id = thisPlayerId;
	data.name = players[thisPlayerId].name;
   

	console.log('score', JSON.stringify(data));
    socket.broadcast.emit('score_to_all', data); // self_Hit Pass  recived is sended to all other User with broadcast
  });
 

 
// API DISCONECT
  socket.on('disconnect', () => {
    numClients--;
	//console.log('numClients----->disconnect :',numClients);
	clearInterval(refreshIntervalId);
	
    delete players[thisPlayerId];

	console.log('client Disconnected');
    socket.broadcast.emit('disconnected',{id: thisPlayerId});
  })

})
/////////////////////////////////END////////////////////////////////////////////////