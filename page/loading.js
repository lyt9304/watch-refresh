/**
 * Created by lyt9304 on 16/3/30.
 */
;(function () {
	function LivereloadMask(){
		this.mask = document.createElement("div");
		this.mask.id = "livereload-mask";
		this.mask.style = "height:100%;width:100%;background:#000;opacity:0.3;position:absolute;top:0;left:0;z-index: 1000;";
		this.loadMark = document.createElement("div");
		this.loadMark.id = "livereload-mask-loadmark";
		this.loadMark.style = "position:absolute;top:50%;left:50%;width:120px;height:120px;margin-top:-60px;margin-left:-60px;overflow:hidden;background:url(http://filesimg.111cn.net/2014/05/20/20140520133715954.gif) no-repeat;"
		this.mask.appendChild(this.loadMark);
	}

	LivereloadMask.prototype.open = function () {
		document.body.appendChild(this.mask);
	};
	
	LivereloadMask.prototype.close = function () {
		document.body.removeChild(this.mask);
	};

	window.LivereloadMask = LivereloadMask;

})();