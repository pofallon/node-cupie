var net = require('net');
var Connection = require('./connection');

// var socket = net.connect({port: 5672}, function() {
// 	console.dir(socket);
// 	var c = new Connection(socket);
// 	c.on('connect', function() {
// 		console.log("Connected!");
// 	})
// });

var server = net.createServer(function(socket) {
	var c = new Connection(socket);
	c.on('connect', function() {
		console.log("Connected!");
	});
});
server.listen(5672, function() {
	console.log("Listening!");
});