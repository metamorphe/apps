Toolbox.DEFAULT = "transform-tool";

function Toolbox(){
	this.init();
	paper.tool = null;
}

Toolbox.prototype={
	getCurrentToolName: function(){
		if(! paper.tool) return null;
		return paper.tool.wrapper.name;
	},	
	init: function(){
		var scope = this;
		_.each($(".tool"), function(dom){
			// make the tool
	    	var toolWrapper = eval("new " + $(dom).attr('data-js') + "()");
	    	toolWrapper.onKeyDown = Toolbox.clickDefault;

	    	toolWrapper.toolbox = scope;
	    	toolWrapper.dom = dom;
			dom.toolWrapper = toolWrapper;

			$(dom).click(function(){
				if(scope.getCurrentToolName() == dom.toolWrapper.name){
					console.log("Already Enabled"); 
					return;
				}
				$('.tool.btn-warning').removeClass('btn-warning').addClass('btn-ellustrate');
				$(this).addClass('btn-warning').removeClass('btn-ellustrate');
				scope.enable(toolWrapper);
			});

	    });
	},
	getActive: function(){
		if(! paper.tool) return null;
		return paper.tool.toolholder;
	},
	enable: function(toolWrapper){
		this.clearTool();
		paper.tool = toolWrapper.tool;
		if(toolWrapper.enable) toolWrapper.enable();
		
	},
	reenable: function(toolWrapper){
		this.clearTool();
		paper.tool = toolWrapper.tool;
		if(toolWrapper.reenable) toolWrapper.reenable();
	},
	clearTool: function(){
		if(!paper.tool) return;

		var toolWrapper = paper.tool.wrapper;
		if(toolWrapper){
			$(toolWrapper.dom).removeClass('btn-warning').addClass('btn-ellustrate');
			toolWrapper.disable();
			toolWrapper.clear();
		}
		
		paper.tool = null;
		paper.view.update();
	}
}



Toolbox.clickDefault = function(event){
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
	if(event.key == "s"){
		$("#save-progress").click().focus();
	}
	if(event.key == "p"){
		$("#print").click().focus();
	}
}