function FabGuide(graph){
	this.ptgs = graph.getPathsToGround();
	this.ptgs = _.sortBy(this.ptgs, function(ptg){ return ptg.length;});
	this.ptgs = _.uniq(this.ptgs, function(ptg){ 
		return (ptg.length / 20).toFixed(0);
	});
	this.paths = _.map(this.ptgs, function(path){
		return _.map(path.str.split('-'), function(el){ return parseInt(el);});
	});
	this.battery = paper.project.getItems({name: "CP:_Battery_1_"})[0];

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
			var dryingtime = Ruler.pts2mm(el.length);
			dryingtime /= 10;
			dryingtime = dryingtime.toFixed(0);
			var guide = [
				{level: 1, elements: [el.solution.id], message: "Draw Trace #" + (i+ 1) + " with your silver ink pen."},
				{level: 2, elements: [el.solution.id], message: "Let these traces dry for "+ dryingtime +" seconds."},
				{level: 2, elements: [scope.battery.id], message: "Add the battery."},
				{level: 2, elements: [el.solution.id], message: "With your multimeter, check if the line is powered."},
				{level: 2, elements: [scope.ledIDs[scope.match[i]]], message: "Place the following LED."},
				{level: 3, elements: [scope.ledIDs[scope.match[i]]], message: "Does the LED turn on?"},
				{level: 2, elements: [scope.battery.id], message: "Remove the battery."}	
			]
			return guide;
		});
		guides = _.flatten(guides);

		_.each(guides, function(el, i, arr){
				console.log(el);
				// var level = el.level == 1 ? "active" : "warning";
				if(el.level == 1) level = "active";
				if(el.level == 2) level = "list-group-item";
				if(el.level == 3) level = "list-group-item-warning";
		    	var guide_dom = $('<li class="list-group-item '+ level +'">'+ el.message +'</li>');
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