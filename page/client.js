;(function(){
	var w=window;
	w.watch={
		pageId: null,
		socket: null,
		fileList: null,
		getPageId: function () {
			return new Date().getTime()+""+Math.floor(Math.random()*899+100);
		},
		init: function(fileList){
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
			this.socket.on("change", function (data) {
				console.log(data);
				console.log("File: "+data.file+" has been changed!");
			});
		},
		//changecss: function (data) {
		//	console.log("css File: "+data+" has been changed!");
		//},
		//changejs: function (data) {
		//	console.log("js File: "+data+" has been changed!");
		//},
		disconnect: function(){
			console.log("disconnecting");
			this.socket.emit("disconnect",{pageId:this.pageId,fileList:this.fileList});
		}
	}
})();