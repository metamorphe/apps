function FabGuide(graph){
	this.ptgs = graph.getPathsToGround();
	this.ptgs = _.sortBy(this.ptgs, function(ptg){ return ptg.length;});
	this.ptgs = _.uniq(this.ptgs, function(ptg){ 
		return (ptg.length / 20).toFixed(0);
	});
}

FabGuide.prototype = {
	updateSidePanel: function(){
		var dom = $('#fab-guide .list-group');
		dom.html("");	
		console.log(this.ptgs);

		var guides = _.map(this.ptgs, function(el, i, arr){
			return {elements: [el.solution.id], message: "Draw the following trace."}
		});
		console.log(guides);
		_.each(guides, function(el, i, arr){
				console.log(el);
		    	var guide_dom = $('<li class="list-group-item active">'+ el.message +'</li>');
		    	guide_dom.attr('data-highlight', el.elements.join(','));
		    	guide_dom.hover(
		    		function(){
			    		elements = $(this).attr('data-highlight').split(',');
			    		// console.log(elements);
			    		_.each(elements, function(el, i, arr){
			    			var el = Node.get(parseInt(el));
			    			OhmTool.glow(el, true);
			    		});
			    	}, 
			    	function(){
			    		elements = $(this).attr('data-highlight').split(',');
			    		// console.log(elements);
			    		_.each(elements, function(el, i, arr){
			    			var el = Node.get(parseInt(el));
			    			OhmTool.glow(el, false);
			    		});
			    	}
			    );
		    	dom.append(guide_dom);
		});
		
	}
}