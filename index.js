var server = require("./server");
var router = require("./router");
var requests = require("./requests").addresses;

server.start(router.route, requests);
//server.startComet();