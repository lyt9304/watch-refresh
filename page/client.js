;(function(){
	var w = window;
	w.booster={
		socket: null,
		fileList: null,
		mask: null,
		/**
		 * 初始化booster
		 * 1. 初始化loading遮罩模块
		 * 2. 寻找该页面的所需要的资源
		 * 3. 连接socket
		 * 4. 监听change事件
		 */
		init: function(){
			this.mask=new w.LivereloadMask();
			this.findFileList();
			this.socket=io("http://localhost:3000");
			this.changeResource();
		},
		/**
		 * 根据src和href中的url分析出对应的资源的名称
		 * @param path 资源路径
		 */
		getResourceName: function (path) {
			//去除可能的?后的参数
			var pathName=path.replace(/\?.*$/,"");
			var pathNameArr=pathName.split("/");
			var len=pathNameArr.length;
			return pathNameArr[len-1];
		},
		/**
		 * 寻找该页面的所需要的资源(css,javascript)
		 */
		findFileList: function () {
			var fileList=[];
			//处理css资源
			var links=document.getElementsByTagName("link");
			for (var i = 0; i < links.length; i++) {
				var link = links[i];
				var href = link.href;
				fileList.push({name:this.getResourceName(href),path:href,dom:link});
			}

			//处理js资源
			var scripts=document.getElementsByTagName("script");
			for (var i = 0; i < scripts.length; i++) {
				var script = scripts[i];
				var src = script.src;
				fileList.push({name:this.getResourceName(src),path:src});
			}

			this.fileList=fileList;
		},
		/**
		 * 监听资源变动的change事件
		 */
		changeResource: function () {
			var that=this;
			this.socket.on("change", function (data) {
				var fileName=data.name;
				var filePath=data.path;

				//TODO:路径映射,不能简单匹配名字,需要一个双向映射的转换模块

				for (var i = 0; i < that.fileList.length; i++) {
					var file = that.fileList[i];
					if(fileName===file.name){
						if(/\.css/.test(fileName)){
							that.changecss(file.dom,fileName);
						} else if (/\.js/.test(fileName)){
							that.changejs();
						} else {
							console.log("未知类型的文件!");
						}
						console.log("File: "+ fileName +" has been changed!");
						return;
					}
				}
				console.log("This resource is not in this page!");
			});
		},
		/**
		 * 处理css的变化
		 * @param name 变动的css文件的名字
		 */
		changecss: function (dom,name) {
			this.mask.open();
			var randomStamp=new Date().getTime()+""+Math.floor(Math.random()*899+100);
			dom.href=dom.href+"?"+randomStamp;
			this.mask.done(name);
		},
		/**
		 * 处理js的变化
		 * @param name
		 * @param path
		 */
		changejs: function () {
			this.mask.open();
			w.location.reload();
		}
	}
})();