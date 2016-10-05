var userList = new Array();
var secret = "test";
var opponent = null;
var yourTurn = false;


function getOnlineUsers(){
	userList = new Array();
	document.getElementById("userList").innerHTML = "";
	broadcast("online");
}
function handleResponse(data){
	if(data==""){
		return;
	}
	data=JSON.parse(data);
	var message=data.data;
	var sender=data.sender;
	if(message=="init"){
	
	}else if(message=="online"){
		if(sender != myName){
			send(sender, "here");
		}
	} else if(message=="here"){
		var u = {
			"name": sender,
		};
		userList.push(u);
		addOnlineUser(sender);
	} else if(sender==opponent && message.indexOf("play")==0){
		var d = message.split(":")[1].split(",");console.log(d);
		play(document.getElementById(d[0]).rows[parseInt(d[1])].cells[parseInt(d[2])]);
		yourTurn = true;
	} else if(message.indexOf("challenge")==0){
		if(opponent==null){
			addChallenge(sender, message.substring(9));
		} else {
			send(sender, "busy");
		}
	} else if(message=="accept"+secret && opponent==null){
		opponent=sender;
		send(sender,"acknowledge");
		gameStarted=true;
		yourTurn = true;
		alert("Connected!");
	} else if(message=="acknowledge" && opponent==null){
		gameStarted=true;
		opponent=sender;
	} else if(message=="busy"){
		alert(sender + " is busy");
	} else if(message=="accept" && opponent!=null){
		send(sender, "busy");
	} else if(message == "magic"){
		alert(sender + ": My magic will tear you apart");
	}
}
function magic(){
	send(opponent, "magic");
}
function questionmark(){
	send(opponent, "ohno");
}
var redAmount=0;

function addOnlineUser(username){
	var ul = document.getElementById("userList");
	var li = document.createElement("li");
	li.innerHTML = username;
	li.username = username;
	li.onclick = function(e){
		challenge(e.target.username);
	};
	ul.appendChild(li);
}
function addChallenge(sender, s){
	var result = confirm("Challenge from "+sender);
	if(result){
		respondToChallenge(sender, s);
	}else{
		return;
	}
}
function respondToChallenge(sender, s){
	send(sender, "accept"+s);
}
function sendPlay(tile){
	rowIndex = tile.parentNode.rowIndex;
	cellIndex = tile.cellIndex;
	var tableID = tile.parentNode.parentNode.parentNode.id;
	console.log("Sent:"+"play:"+tableID+","+rowIndex+","+cellIndex);
	send(opponent, "play:"+tableID+","+rowIndex+","+cellIndex);
}
function challenge(otherUser){
	if(opponent!=null){
		alert("Already in game!");
	}
	send(otherUser, "challenge"+secret);
}