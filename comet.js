var sys = require("sys");

var cometUsers = new Array();
var cometUserMap = {};
var interval;
var checkinTimeout = 10000;
var plays = new Array();

function broadcast(sender,data){
	var now = (new Date()).getTime();
	for(var i = 0; i < cometUsers.length; i++){
		//sys.puts("Sending comet data");
		if(now-cometUsers[i].lastCheckIn > checkinTimeout){
		sys.puts(cometUsers[i].name + " did not check in, last checkin at " + cometUsers[i].lastCheckIn);
			delete cometUserMap[cometUsers[i].name];
			cometUsers.splice(i, 1);
			i--;
			continue;
		}
		cometUsers[i].sendMessage(sender, data);
	}
}
function addUser(response, query){
	name=query.name;
	if(!(cometUserMap[name]===undefined) && query.pin==cometUserMap[name].pin){
		switchResponse(response, name);
		sys.puts("already there");
		//keepAlive(name);
		return;
	} else if(!(cometUserMap[name]===undefined)){
		return;
	}
	var us = new cometUser(response, name);
	us.sendMessage("Server","init");
	cometUsers.push(us);
	cometUserMap[name] = us;
	cometUserMap[name].pin=query.pin;
	sys.puts("Pin is " + query.pin);
	keepAlive(name);
	sys.puts(cometUserMap[name].name +" added");
}

function keepAlive(name){
	if(!(cometUserMap[name]===undefined))
		cometUserMap[name].lastCheckIn=(new Date()).getTime();
		sys.puts((new Date()).getTime());
}
function startListen(){
	
	interval=setInterval(function(){ broadcast("Server","Test"); }, 5000);
}
function sendResults(){
	var results="";
	while(plays.length > 0){
		results+=plays[0].Player + ": " + plays[0].Play+";,;,;,;";
		plays.splice(0, 1);
	}
	for(var i = 0; i < cometUsers.length; i++){
		cometUsers[i].playedThisRound=false;
	}
	broadcast("Server","Results\n"+results);
}
function switchResponse(response, name){
	sys.puts("Switching now");
	cometUserMap[name].response.end();
	cometUserMap[name].response=response;
	//keepAlive(name);
	response.write("switch");
}
function cometUser(response, name){
	this.response=response;
	this.name=name;
	this.pin="nothing";
	this.lastCheckIn=0;
	this.sendMessage=function(sender, data){
		this.response.write(JSON.stringify({
			"sender": sender,
			"data": data
		})+"\n");
	}
}
function handleMessage(data){
	var message=JSON.parse(data.message);
	if(!(data.name in cometUserMap)){
		return;
	}
	if(message.pin != cometUserMap[data.name].pin){
		return;
	}
	if(message.type=="broadcast"){
		broadcast(data.name, message.data);
	} else{
		if(message.to in cometUserMap){
			cometUserMap[message.to].sendMessage(data.name, message.data);
		}
	}
	
	
}
exports.cometUsers = cometUsers;
exports.addUser = addUser;
exports.keepAlive = keepAlive;
exports.startListen = startListen;
exports.handleMessage = handleMessage;