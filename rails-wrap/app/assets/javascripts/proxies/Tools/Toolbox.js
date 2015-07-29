
function Toolbox(paper, dom){
	this.paper = paper;
	this.tools = {};
	this.init();
	this.paper.tool = null;
}

Toolbox.prototype={
	init: function(){
		// this.add("vectortool", new VectorTool(this.paper));
	},
	enable: function(key){
		this.paper.tool = this.tools[key].tool;
	},
	disableAll: function(){
		var scope = this;
		this.paper.tool = null;
	},
	add:function(name, dom, tool){
		var scope = this;
		tool.tool.toolholder = tool;
		this.tools[name] = {dom: dom, toolholder: tool};
		dom.click(function(){
			console.log("Enabling", name);
			scope.clearTool();
			paper.tool = scope.tools[name].toolholder.tool;
		});
	},
	clearTool: function(){
		if(!_.isNull(this.paper.tool)){
			this.paper.tool.toolholder.clear();
		}
		this.paper.tool = null;
		this.paper.view.update();
	}
}