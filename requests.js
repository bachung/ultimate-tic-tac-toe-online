var fs = require("fs");
var sys = require("sys");
var comet = require("./comet");
var addresses = {
				"/": index,
				"/things": things,
				"/comet": handleComet,
				"/comet/send": cometReceive,
				"/checkin": cometCheckIn,
				"?" : getStaticFile
				}
				
function index(request, response, query) {
	var resp=response;
	//sys.puts(resp);
	fs.readFile("templates/index.html", null, function(err, data) { response.writeHeader(200, {"Content-Type": "text/html"}); resp.write(data); resp.end();});
}
function things(request, response, query) {
	var resp=response;
	//sys.puts(resp);
	fs.readFile("templates/cometTestUnobfuscated.html", null, function(err, data) { response.writeHeader(200, {"Content-Type": "text/html"}); resp.write(data); resp.end();});

}
function handleComet(request, response, query) {
	response.writeHeader(200, {"Content-Type": "text/html", "Access-Control-Allow-Origin":"*"});
	if(query.update=="true"){
		sys.puts("THINGS!");
	}
	comet.addUser(response, query);
}
function cometReceive(request, response, query){
	response.write("Success");
	response.end();
	comet.handleMessage(query);
}
function cometCheckIn(request, response, query) {
	comet.keepAlive(query.name);
	response.write("a");
	response.end();
}

function writeToResponse(pathname, response, contentHeader) {
	fs.readFile(pathname, function(err, data){
			if(err){
				response.writeHeader(200, {"Content-Type": "text/html"});
				response.write("Page does not exist");
			} else{
				response.writeHeader(200, {"Content-Type": contentHeader});
				response.write(data);
				//sys.puts("Wrote script");
			}
			response.end();
		});
		//sys.puts("In the middle of reading script");
}
function getStaticFile(pathname, response, query) {
	if(pathname.indexOf("/scripts/")==0) {
		pathname = pathname.substring(1);
		//return fs.existsSync(pathname) ? [fs.readFileSync(pathname), "text/javascript"] : ["Page does not exist", "text/html"];
		writeToResponse(pathname, response, "text/javascript");
		//sys.puts("Writing script!");
	}
	if(pathname.indexOf("/style/")==0) {
		pathname = pathname.substring(1);
		//return fs.existsSync(pathname) ? [fs.readFileSync(pathname), "text/css"] : ["Page does not exist", "text/html
		writeToResponse(pathname, response, "text/css");
		//sys.puts("Writing script!");
	}
	if(pathname.indexOf("/images/")==0) {
		pathname = pathname.substring(1);
		//return fs.existsSync(pathname) ? [fs.readFileSync(pathname), "text/javascript"] : ["Page does not exist", "text/html"];
		writeToResponse(pathname, response, "text/javascript");
	}
	if(pathname.indexOf("/sound/")==0){
		pathname = pathname.substring(1);
		//return fs.existsSync(pathname) ? [fs.readFileSync(pathname), "text/javascript"] : ["Page does not exist", "text/html"];
		writeToResponse(pathname, response, "audo/ogg");
	}
	return ["Page does not exist", "text/html"];
}

exports.addresses = addresses;