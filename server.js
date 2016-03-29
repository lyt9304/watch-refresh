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
var path=require("path");git

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
		var file = data.fileList[i];
		if(!resourceOffice[file]){
			resourceOffice[file]=[];
		}
		resourceOffice[file].push(data.pageId);
	}
}

/**
 * 当页面被关闭触发disconnect
 * @param data:{pageId}
 */
function removePage(data){
	if(!pageOffice.hasOwnProperty(data.pageId)){
		log.error("没有找到该pageId!");
		return;
	}
	delete pageOffice[data.pageId];
	pageCount--;

	//清理resourceOffice
	for (var i = 0,len=data.fileList.length; i < len; i++) {
		var file = data.fileList[i];
		if(!resourceOffice[file]){
			log.error("没有在resourceOffice中找到对应的文件");
			return;
		}
		util.removeAllElem(resourceOffice[file],data.pageId);

		//TODO:
		//if(resourceOffice[file].length===0){
		//	watcher.unwatch()
		//}
	}
}



/**
 * 将新加入的fileList加入watcher中
 * @param fileList
 */
function addFileWatch(watcher,fileList){
	//watcher.add(fileList);
}

/**
 * 当没有页面需要某一个file时就从watcher中去除这个file
 * @param fileList
 */
function removeFileWatch(watcher,file){
	//watcher.remove(file);
}

io.on('connection',function(socket){

	log.info();

	var watcher = chokidar.watch(path.join(__dirname,"resource"), {
		ignored: /[\/\\]\./,
		persistent: true
		//cwd:process.cwd()
	});

	watcher.unwatch(path.join(__dirname,"resource"));

	watcher
		.on('add', function (file, stats) {
			log.info("File:" + file + " has been added");
		})
		.on('change', function (file, stats) {
			log.info("File:" + file + " has been changed");
			if(resourceOffice[file] && resourceOffice.length!=0 && util.contains(resourceOffice[file],socket.name)){
				socket.emit("change",{file:path.basename(file)});
			}
		})
		.on('unlink', function (file,stats) {
			log.info("File:" + file + " has been removed");
		});

	//connect之后再客户端生成uuid然后在服务器上注册
	socket.on('register',function(data){
		log.debug("in register!");
		socket.name=data.pageId;
		addPage(data);

		for (var i = 0,len=data.fileList.length; i < len; i++) {
			var obj = data.fileList[i];
			watcher.add(obj);
		}

		log.debug("pageOffice"+JSON.stringify(pageOffice));
		log.debug("resourceOffice:"+JSON.stringify(resourceOffice));
	});

	socket.on('disconnect',function(data){
		log.debug("in disconnect");
		removePage(data);

		log.debug("pageOffice"+JSON.stringify(pageOffice));
		log.debug("resourceOffice:"+JSON.stringify(resourceOffice));
	})
});





