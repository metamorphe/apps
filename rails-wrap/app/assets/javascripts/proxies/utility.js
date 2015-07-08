function Utility(){

}

Utility.unpackChildren = function(parent, arr){
	if(_.isUndefined(parent.children)){
		arr.push(parent);
		return arr;
	}
	else{
		for(var i = 0; i < parent.children.length; i++){
			Utility.unpackChildren(parent.children[i], arr);
		}
	}
	return arr;
}