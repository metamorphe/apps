
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
		this.clearTool();
		this.paper.tool = this.tools[key].toolholder.tool;
	},
	disableAll: function(){
		var scope = this;
		this.clearTool();
	},
	add:function(name, dom, tool){
		var scope = this;
		tool.tool.toolholder = tool;
		tool.tool.name = name;
		this.tools[name] = {dom: dom, toolholder: tool, name: name};
		dom.click(function(){
			if(scope.paper.tool && scope.paper.tool.name == name) return;
			console.log("Enabling", name);
			scope.enable(name);
		});
		var origOnKeyDown = tool.onKeyDown;
		var scope = this;
		tool.onKeyDownDefault = function(event){
			if(event.key == "backspace")
				event.preventDefault();

			// vector tool
			if(event.key == "v"){
				$('#transform-tool').click().focus();
			}
			// anchor tool
			if(event.key == "a"){
				$('#anchor-tool').click().focus();
			}
		}

	},
	clearTool: function(){
		if(!_.isNull(this.paper.tool)){
			this.paper.tool.toolholder.clear();
		}
		this.paper.tool = null;
		this.paper.view.update();
	}
}