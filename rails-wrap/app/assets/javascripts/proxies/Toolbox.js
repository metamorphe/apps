function Toolbox(dom){
	this.tools = [];
}

Toolbox.prototype={
	add:function(tool){
		this.tools.push(tool);
	}
}