var app = require('express')();
var server = require('http').Server(app);

const io = require('socket.io')(server);
var shortid = require('shortid');
server.listen(3033);


console.log('server started');
app.get('/checked', function(req, res) {
	res.send('hey you got back get "/"');
	console.log('--- Url Call ...');
});



/////////////////////////////////START////////////////////////////////////////////////

var players = [];

io.on('connection', (socket) => {

///////////////////////////////////////////////Call Only Once At Any Player Connected //////////////////////////////////////////////////////////////////////////




  console.log('client Connected');

  var thisPlayerId = shortid.generate();
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
 

 
 
 
 ///////////////////////////////////////////////Call Only Once At Any Player Connected //////////////////////////////////////////////////////////////////////////
 
 
 
 
 
 //-------------------------------------------Call Api By At Event Calling Time [self_move_pos/updatePosition/follow]-------------------------------------------

 // API Know Player Name -> Self Know Player Name call
  socket.on('self_player_name', (data) => {
    
	
	data.id = thisPlayerId;
    players[thisPlayerId].name = data.name;// In Collection Change Name
	
	console.log('Call Player Name Register', JSON.stringify(data));
   socket.broadcast.emit('player_name', data); // self_move_pos recived is sended to all other User with broadcast

  });
 


// API MOVE -> Self movement call
  socket.on('self_move_pos', (data) => {
    data.id = thisPlayerId;
	data.name = players[thisPlayerId].name;
   

    player.x = data.x;
    player.y = data.y;
    
	console.log('client moved', JSON.stringify(data));
    socket.broadcast.emit('new_movement_pos', data); // self_move_pos recived is sended to all other User with broadcast

  });
  
// API UPDATE POSITION -> Self movement call
  socket.on('updatePosition', (data) => {
    

    data.id = thisPlayerId; // Self data
	data.name = players[thisPlayerId].name;
	
	console.log("update position: ", data);
    socket.broadcast.emit('updatePosition' , data);// Self data send to all
  });

 
// API FOLLOW
  socket.on('follow', (data) => {
    

    data.id = thisPlayerId;// Self data
    
	console.log("follow request: ", data);
    socket.broadcast.emit('follow' , data);// Self data send to all
  });

// API ATTECK
  socket.on('attack', (data) => {
    

    data.id = thisPlayerId;

	console.log("attack request: ", data);
    io.emit('attack' , data);
  });

// API Jump
  socket.on('jump', (data) => {
   

    data.id = thisPlayerId;
	data.name = players[thisPlayerId].name;
	
	console.log("jump request: ", data);
    io.emit('jump' , data);
  });

// API Fall
  socket.on('fall', (data) => {
    

    data.id = thisPlayerId;
	data.name = players[thisPlayerId].name;
	
	console.log("fall request: ", data);
    io.emit('fall' , data);
  });

// API DISCONECT
  socket.on('disconnect', () => {
    

    delete players[thisPlayerId];

	console.log('client Disconnected');
    socket.broadcast.emit('disconnected',{id: thisPlayerId});
  })

})
/////////////////////////////////END////////////////////////////////////////////////