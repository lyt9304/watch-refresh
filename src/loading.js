/**
 * Created by lyt9304 on 16/3/30.
 */

function LivereloadMask(){
	this.mask = document.createElement("div");
	this.mask.id = "livereload-mask";
	this.mask.style = "height:100%;width:100%;background:#000;opacity:0.3;position:absolute;top:0;left:0;z-index: 1000;";
	this.loadMark = document.createElement("div");
	this.loadMark.id = "livereload-mask-loadmark";
	this.loadMark.style = "position:absolute;top:50%;left:50%;width:80px;height:80px;margin-top:-40px;margin-left:-40px;overflow:hidden;background:url(http://filesimg.111cn.net/2014/05/20/20140520133715954.gif) no-repeat;background-position: center center;background-size:100% 100%;";
	//this.doneMark = document.createElement("div");
	//this.doneMark.id = "livereload-mask-donemark";
	//this.doneMark.style = "position:absolute;top:50%;left:50%;width:120px;height:120px;margin-top:-60px;margin-left:-60px;overflow:hidden;background:url(http://iconpng.com/png/essentials/check41.png) no-repeat;background-position: left top;background-size:100% 100%;";
	this.doneMessage = document.createElement("p");
	this.doneMessage.id = "livereload-mask-donemessage";
	this.doneMessage.style = "position:absolute;top:50%;left:50%;width:200px;margin-left:-100px;margin-top:0px;text-align:center;color:white";
	this.doneMessage.innerText = "xxfile已经被更新了!";
}

LivereloadMask.prototype.clean = function () {
	var children = this.mask.childNodes;
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		this.mask.removeChild(child);
	}
};

LivereloadMask.prototype.addClick = function () {
	if(window.addEventListener){
		this.mask.addEventListener("click",this.close.bind(this),false);
	}else if(window.attachEvent){
		this.mask.attachEvent("click",this.close.bind(this));
	}else{
		this.mask.onclick=this.close.bind(this);
	}
};

LivereloadMask.prototype.open = function () {
	this.clean();
	this.mask.appendChild(this.loadMark);
	document.body.appendChild(this.mask);
};

LivereloadMask.prototype.done = function (fileName) {
	this.clean();
	this.doneMessage.innerText=fileName+"已经被修改了";
	this.mask.appendChild(this.doneMessage);
	document.body.appendChild(this.mask);
	this.addClick();
};

LivereloadMask.prototype.close = function () {
	document.body.removeChild(this.mask);
};

module.exports=LivereloadMask;
