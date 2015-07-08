function Toolbox(dom){
	this.tools = {};
}

Toolbox.prototype={
	add:function(name, tool){
		console.log(name, tool);
		this.tools[name] = tool;
	}
}