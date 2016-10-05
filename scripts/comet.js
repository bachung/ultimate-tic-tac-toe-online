var interval; //interval for checking if the response has been updated
var switchCheck; //interval for checking if the XMLHttpRequest has been switched
				 //this is necessary because otherwise the responseText may become too large
var previous=""; //the responseText from when it was last updated
var previousLength=0; //length of responseText from when it was last updated, used to get new text
var req; //the initial request for comet
var pin=0000;
var switching = false;
var finishedSwitch=false;
var newReq = new XMLHttpRequest(); //the request to replace the other
								   //we need two requests because the first one has to be kept alive until the server confirms the switch
								   //after this, the original request can be replaced with the new one, which will handle the next 100 messages
var count=0; //holds the number of messages read (reset after every 100)
var myName; //holds the identifier of the client, to be used by the server to uniquely identify users
var lastMessageTime=0;
/*function handleResponse(data){
	if(data==''){
		return;
	}
	data = JSON.parse(data);
	var currentMessageTime = (new Date()).getTime();
	console.log(data.sender+": "+data.data);
	console.log("delay: "+ (currentMessageTime-lastMessageTime));
	lastMessageTime=currentMessageTime;
}*/

function readRequest(){
//console.log("checking");
	if(req.responseText.length>previousLength){ //have received new messages from the server
		if(req.responseText!="initinitinitinit"){ //this init text is sent to initialize the comet, without it, there will be a delay before the client can read the response from the server
			var arr = req.responseText.substring(previousLength).split("\n");
			//console.log("Received Full: " + req.responseText.substring(previousLength));
			for(var i = 0; i < arr.length; i++){
				handleResponse(arr[i]);
			}
			//handleResponse(req.responseText.substring(previousLength)); //append what's new to the div
			//window.scrollTo(0,document.body.scrollHeight);
			}
		//console.log(previous);
		previous=req.responseText; //update the "previous" text for reference
		previousLength=previous.length; //get length so the next time the text is updated, it can be substringed to show only the new text
		count++; //add to number of messages received
		if(count>=100 && !switching){ //after 100, make a new request so responseText doesn't overflow
			console.log(req.responseText.length);
			console.log(count);
			switchRequest(); //start the switch, continue using the current request until the switch is finished
			count=0; //reset count after initializing switch			
		}
	}
	if(finishedSwitch){
			req.abort(); //can end this old request now
			console.log("Old: "+req.responseText);
			console.log("New: " +newReq.responseText);
			req=newReq; //use the new request instead
			newReq = new XMLHttpRequest(); //reset the former new request to nothing
			previous=req.responseText; //set previous to the responseText so readRequest functions properly
			if(previous.indexOf("switch")==0){
				previousLength=6;
			}else{
			previousLength=previous.length; //same as above
			}
			count=0; //it is possible that the client may have received messages before the switch was completed
			finishedSwitch=false;
			readRequest();
			//document.getElementById("response").innerHTML+="Things\n";
		}
}
function checkSwitch(){
	if(newReq.responseText.length>0){ //once data has been received in the new request, it means that the server has acknowledged us
		console.log("Switching");
		clearInterval(switchCheck); //no need to check if the server has acknowledged us anymore, so clear the interval
		switching=false;
		finishedSwitch=true;
	}
}
function connect(name){
	pin = Math.floor((Math.random() * 100000000) + 1);
	myName=name; //set unique identifier to name
	req = new XMLHttpRequest(); //create a new request
	req.open("GET", "/comet" + "?name=" + name+"&pin="+pin); //connect to comet
	req.send(); //send the request
	//document.getElementById("response").innerHTML+="Sent";
	interval=setInterval(readRequest, 1); //periodically check for updates to the response
	setInterval(heartbeat, 5000);
	setInterval(switchRequest, 30000);
	//setInterval(function(){ send("hello"); }, 100);
}
function heartbeat(){
	console.log("Heartbeat");
	var hbeat = new XMLHttpRequest();
	hbeat.open("GET", "/checkin" + "?name=" + myName+"&pin="+pin+"&"+(new Date()).getTime());
	hbeat.send();
}
function switchRequest(){
	//newReq = 
	switching=true;
	newReq.abort(); 
	newReq.open("GET", "/comet" + "?update=true&name=" + myName+"&pin="+pin + "&"+(new Date()).getTime()); //timestamp added to bypass cache
	newReq.send();
	checkSwitch(); //start checking if it has switched already, highly unlikely
	//console.log(req.responseText);
	switchCheck=setInterval(checkSwitch, 10); //check every 10ms if the server has acknowledged the new connection
	console.log(newReq.responseText);
}
function send(to,data){
	var msg = new XMLHttpRequest();
	data=JSON.stringify({"data":data,"type":"pm","to":to,"pin":pin});
	msg.open("GET", "/comet/send" + "?name=" + encodeURIComponent(myName)+"&pin="+pin+"&message="+encodeURIComponent(data)+"&"+(new Date()).getTime());
	msg.send();
}
function broadcast(data){
	var msg = new XMLHttpRequest();
	data=JSON.stringify({"data":data,"type":"broadcast","pin":pin});
	msg.open("GET", "/comet/send" + "?name=" + encodeURIComponent(myName)+"&type=broadcast&pin="+pin+"&message="+encodeURIComponent(data)+"&"+(new Date()).getTime());
	msg.send();
}