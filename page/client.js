;(function(){
	var w = window;
	w.watch={
		pageId: null,
		socket: null,
		fileList: null,
		mask: null,
		getPageId: function () {
			return new Date().getTime()+""+Math.floor(Math.random()*899+100);
		},
		init: function(fileList){
			this.mask=new w.LivereloadMask();
			this.fileList=fileList;
			this.socket=io("http://localhost:3000");
			this.pageId=this.getPageId();
			this.register();
			this.changeResource();
		},
		register: function(){
			this.socket.emit("register",{pageId:this.pageId,fileList:this.fileList});
		},
		changeResource: function () {
			var that=this;
			this.socket.on("change", function (data) {
				//console.log(data);
				var fileName=data.file;
				var filePath=data.source;
				if(/\.css/.test(fileName)){
					that.changecss(fileName,filePath);
				} else if (/\.js/.test(fileName)){
					that.changejs(fileName,filePath);
				} else {
					console.log("未知类型的文件!");
				}
				console.log("File: "+ fileName +" has been changed!");
			});
		},
		changecss: function (name,path) {
			this.mask.open();
			var rname=new RegExp(name);
			var links=document.getElementsByTagName("link");
			for (var i = 0; i < links.length; i++) {
				var obj = links[i];
				var href = obj.href;
				if(rname.test(href)){
					obj.href=path;
				}
			}
			console.log("css File: "+ name +" has been changed!");
			this.mask.done(name);
		},
		changejs: function (name,path) {
			var rname=new RegExp(name);
			var scripts=document.getElementsByTagName("script");
			for (var i = 0; i < scripts.length; i++) {
				var obj = scripts[i];
				var src = obj.src;
				if(rname.test(src)){
					obj.src=path;
					console.log("src changed!");
					console.log(obj);
				}
			}
			console.log("js File: "+ name +" has been changed!");
		}
	}
})();