/** Server
 * Created by lyt9304 on 16/3/29.
 */
var server=require("http").createServer(function(req,res){
	res.writeHead(200,{'Content-type':'text/plain'});
	res.end("Hello World!\n");
});
var io=require("socket.io")(server);
var port=process.env.PORT || 3000;
var chokidar=require("chokidar");
var util=require("./util");
var log=require("./log");
var path=require("path");

server.listen(port, function () {
	console.log('Server listening at port %d', port);
});


/**
 * pageOffice记录现在保持连接的页面
 * @type {{}}
 */
var pageOffice={};

/**
 * pageCount记录现在保持连接的页面的数量
 * @type {number}
 */
var pageCount=0;

/**
 * resourceOffice 是管理页面以及其关注的文件的一个注册中心
 * key(文件)-value(对应页面id的数组)
 * @type {{}}
 */
var resourceOffice={};

/**
 * 加入新的页面
 * @param data:{pageId,fileList}
 */
function addPage(data){
	if(pageOffice.hasOwnProperty(data.pageId)){
		log.error("已经存在该pageId!");
		return;
	}
	pageOffice[data.pageId]=true;
	pageCount++;

	if(!util.isArray(data.fileList)){
		log.error("需要数组形式的关注文件列表");
		return;
	}

	//添加resouceOffice
	for (var i = 0,len=data.fileList.length; i < len; i++) {
		var fileItem = data.fileList[i];
		if(!resourceOffice[fileItem]){
			resourceOffice[fileItem]=[];
		}
		resourceOffice[fileItem].push(data.pageId);
	}
}

/**
 * 当页面被关闭触发disconnect
 * @param name {String} socket标示符name,通过这个来删除这个socket的相关数据
 */
function removePage(name){
	if(!pageOffice.hasOwnProperty(name)){
		log.error("没有找到该pageId!");
		return;
	}
	delete pageOffice[name];
	pageCount--;

	//清理resourceOffice
	for(var fileItem in resourceOffice){
		var pageList=resourceOffice[fileItem];
		util.removeAllElem(pageList,name);
	}
}

io.on('connection',function(socket){

	//初始化watcher文件监控器
	var watcher = chokidar.watch(path.join(__dirname,"resource"), {
		ignored: /[\/\\]\./,
		persistent: true
		//cwd:process.cwd()
	});
	watcher.unwatch(path.join(__dirname,"resource"));

	//为watcher添加add/change/unlink(remove)事件
	watcher
		.on('add', function (file) {
			log.info("File:" + file + " has been added");
		})
		.on('change', function (file) {
			log.info("File:" + file + " has been changed");
			if(resourceOffice[file] && resourceOffice.length!=0 && util.contains(resourceOffice[file],socket.name)){
				socket.emit("change",{file:path.basename(file)});
			}
		})
		.on('unlink', function (file) {
			log.info("File:" + file + " has been removed");
		});

	//connect之后再客户端生成uuid然后触发register事件在服务器上注册
	socket.on('register',function(data){

		log.debug("in register!");

		//socket.name就是pageId,并且将成为辨识每一个客户端的符号
		socket.name=data.pageId;

		//处理pageOffice和resourceOffice相关
		addPage(data);

		//为watcher添加相关的文件
		for (var i = 0,len=data.fileList.length; i < len; i++) {
			var fileItem = data.fileList[i];
			watcher.add(fileItem);
		}

		log.debug("pageOffice"+JSON.stringify(pageOffice));
		log.debug("resourceOffice:"+JSON.stringify(resourceOffice));
	});

	socket.on('disconnect',function(){

		log.debug("disconnecting!");

		//处理pageOffice和resourceOffice相关
		removePage(socket.name);

		//处理watcher,如果没有需要该文件的页面,那么就执行unwatch
		for (var fileItem in resourceOffice) {
			var pageList = resourceOffice[fileItem];
			if(util.isArray(pageList)&&pageList.length===0){
				watcher.unwatch(fileItem);
				log.debug("unwatch file:"+fileItem);
				delete resourceOffice[fileItem];
			}
		}

		log.debug("pageOffice"+JSON.stringify(pageOffice));
		log.debug("resourceOffice:"+JSON.stringify(resourceOffice));
	});
});





