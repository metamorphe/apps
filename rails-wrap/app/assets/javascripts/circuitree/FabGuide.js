function FabGuide(graph){
	this.ptgs = graph.getPathsToGround();
	this.ptgs = _.sortBy(this.ptgs, function(ptg){ return ptg.length;});
	this.ptgs = _.uniq(this.ptgs, function(ptg){ 
		return (ptg.length / 20).toFixed(0);
	});
	this.paths = _.map(this.ptgs, function(path){
		return _.map(path.str.split('-'), function(el){ return parseInt(el);});
	});
	var leds = paper.project.getItems({name:"CP:_circuit_x5F_led_1_"});
	this.ledIDs = _.map(leds, function(led){
			return led.id;
	});
	this.leds = _.map(leds, function(el){
		positive_terminal = EllustrateSVG.match(el, {prefix: ["CVT"]})[0].path;
		if(!_.isUndefined(positive_terminal)) positive_terminal = positive_terminal.terminals;
		else positive_terminal = [];

		negative_terminal = EllustrateSVG.match(el, {prefix: ["CGT"]})[0].path; 
		if(!_.isUndefined(negative_terminal)) negative_terminal = negative_terminal.terminals;
		else negative_terminal = [];
		return _.flatten([positive_terminal, negative_terminal]); 
	});
	this.match = this.matchLEDsToPaths();
	// console.log("MATCH", match);

}

FabGuide.prototype = {
	matchLEDsToPaths: function(){
		var match = [];
		for(var i in this.leds){
			var led = this.leds[i];
			var is_connected = false;
			for(var j in this.paths){
				var nodes = this.paths[j];
				var in_path = _.reduce(led, function(memo, terminal){
					// console.log(terminal, nodes)
					var inside = nodes.indexOf(terminal) > -1;
					if(inside)
						return memo + 1;
					else
						return memo;
				}, 0);
				console.log("FB", nodes, led, in_path);
				is_connected = is_connected || in_path >= 2;
				if(is_connected){
					match.push(j);
					break;
				}
			}
			if(match.length != i+1) match.push(false);
		};
		return match;
	},
	updateSidePanel: function(){
		var scope = this;
		var dom = $('#fab-guide .list-group');
		dom.html("");	
		console.log(this.ptgs);

		var guides = _.map(this.ptgs, function(el, i, arr){
			var guide = [
				{elements: [el.solution.id], message: "Draw the following trace."},
				{elements: [scope.ledIDs[scope.match[i]]], message: "Place the following LED."}
			]
			return guide;
		});
		guides = _.flatten(guides);

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