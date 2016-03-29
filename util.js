/**
 * Created by lyt9304 on 16/3/29.
 */

var util={
	isArray: function (arr) {
		return Object.prototype.toString.call(arr) == '[object Array]';
	},
	removeAllElem: function (arr,val) {
		for (var i = 0; i < arr.length; i++) {
			var obj = arr[i];
			if(val===obj){
				arr.splice(i,1);
				i--;
			}
		}
	},
	contains: function (arr,val) {
		for (var i = 0; i < arr.length; i++) {
			var obj = arr[i];
			if(obj===val){
				return true;
			}
		}
		return false;
	}
};

module.exports=util;
