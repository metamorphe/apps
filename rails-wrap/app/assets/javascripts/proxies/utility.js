function Utility(){

}

Utility.unpackChildren = function(parent, arr){
	if(_.isUndefined(parent.children)){
		arr.push(parent);
		return arr;
	}
	else{
		for(var i in parent.children){
			this.unpackChildren(parent.children[i], arr);
		}
	}
	return arr;
}