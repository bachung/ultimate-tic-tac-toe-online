var sys = require("sys"),
my_http = require("http");
var url = require("url");
var fs = require("fs");
var comet = require("./comet");




function start(route, addresses) {
	my_http.createServer(function(request,response){
		var parsedURL = url.parse(request.url, true);
		var pathname = parsedURL.pathname;
		var query = parsedURL.query;
		sys.puts("Request received");

		//sys.puts(r);
		//response.writeHeader(200, {"Content-Type": "text/html"});
		//sys.puts(response);
		route(pathname, addresses, request, response, query);
		//response.write(r[0]);
		//response.end();
	}).listen(8081);
	comet.startListen();
	
	sys.puts("Server Running on 8081");	
	//sys.puts(fs.existsSync("scripts/things.txt"));
}
exports.start = start;