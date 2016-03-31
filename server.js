/** Server
 * Created by lyt9304 on 16/3/29.
 */

var chokidar=require("chokidar");
var util=require("./util");
var log=require("./log");
var path=require("path");

/**
 * Server config and create
 */
var port=process.env.PORT || 3000;
var server=require("http").createServer(function(req,res){
	res.writeHead(200,{'Content-type':'text/plain'});
	res.end("Hello World!\n");
});
var io=require("socket.io")(server);
server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

/**
 * Socket.io Server Handler
 */
io.on('connection',function(socket){

	log.info("in connection!");

	//初始化watcher文件监控器
	var watcher = chokidar.watch(path.join(__dirname,"resource"), {
		ignored: /[\/\\]\./,
		persistent: true
		//cwd:process.cwd()
	});

	//为watcher添加add/change/unlink(remove)事件
	watcher
		.on('add', function (file) {
			log.info("File:" + file + " has been added");
		})
		.on('change', function (file) {
			log.info("File:" + file + " has been changed");
			socket.emit("change",{name:path.basename(file),path:file});
		})
		.on('unlink', function (file) {
			log.info("File:" + file + " has been removed");
		});

	socket.on('disconnect',function(){
		log.debug("disconnecting!");
	});
});





