function FabGuide(graph){
	this.dom = $('#fab-guide .list-group');
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
				// console.log("FB", nodes, led, in_path);
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
		this.dom.html("");	
		
		var guides = _.map(this.ptgs, function(el, i, arr){
			dryingtime = 60;
			ohmage = sr_model.apply(el.solution);
			
			ohmage_upperbound = 2 * ohmage; 
			ohmage_upperbound = ohmage_upperbound.toFixed(0);

			led_terminals = scope.leds[i];
			
			var guide = [
				{level: 1, 
					elements: [el.solution.id], 
					message: "Draw Trace #" + (i+ 1) + " with your silver ink pen."},
				{level: 2, 
					elements: [el.solution.id], 
					message: "Let these traces dry for <b>"+ dryingtime +" seconds</b>.", 
					time: dryingtime },
				{level: 3, 
					multimeter: "resistance", 
					probeA: el.nodes[0], 
					probeB: led_terminals[0],  
					elements: [el.solution.id], 
					message: "Check the resistance of this trace. If the multimeter reads greater than <b>" + ohmage_upperbound + " Ω</b>, then let it dry a bit longer."},
				{level: 3, 
					multimeter: "resistance", 
					probeA: led_terminals[1], 
					probeB: el.nodes[el.nodes.length -1],  
					elements: [el.solution.id], 
					message: "Check the resistance of this trace. If the multimeter reads greater than <b>" + ohmage_upperbound + " Ω</b>, then let it dry a bit longer."},
				{level: 2, 
					elements: [scope.battery.id], 
					message: "Add the battery."},
				{level: 2, 
					multimeter: "voltage", 
					probeA: led_terminals[0], probeB: led_terminals[1], elements: [el.solution.id], message: "With your multimeter, check if the line is powered (voltage setting). Position the probes on the dots."},
				{level: 2, 
					elements: [scope.ledIDs[scope.match[i]]], 
					message: "Place the following LED."},
				{level: 3, 
					elements: [scope.ledIDs[scope.match[i]]], 
					message: "Does the LED turn on?"},
				{level: 2, 
					elements: [scope.battery.id], 
					message: "Remove the battery."}	
			]
			return guide;
		});
		guides = _.flatten(guides);
		this.setGuides(guides);	
	}, 
	setGuides: function(guides){
		var scope = this;
		_.each(guides, function(el, i, arr){
				// console.log(el);
				// var level = el.level == 1 ? "active" : "warning";
				if(el.level == 1) level = "active";
				if(el.level == 2) level = "list-group-item";
				if(el.level == 3) level = "list-group-item-warning";
		    	

		    	var guide_dom = $('<li class="list-group-item '+ level +'">'+ el.message +'</li>');
		    	guide_dom.attr('data-highlight', el.elements.join(','));
		    	if(el.multimeter){
			    	guide_dom.attr('data-multimeter', el.multimeter);
			    	guide_dom.attr('data-probe-a', el.probeA);
			    	guide_dom.attr('data-probe-b', el.probeB);
				}		    	

		    	guide_dom.hover(
		    		function(){
				    	// MULTIMETER LOGIC
		    			mm = $(this).attr('data-multimeter');
			    		if(! _.isUndefined(mm)){
				    		probeA = parseInt($(this).attr('data-probe-a'));
				    		probeB = parseInt($(this).attr('data-probe-b'));
				    		
			    			posA = graph.find(probeA).getPosition();
			    			posB = graph.find(probeB).getPosition();
			    			
			    			multimeter.show(mm, posA, posB);
			 	   			
					    }	
					    else multimeter.hide();

					    elements = $(this).attr('data-highlight').split(',');
					    // LIGHT UP THE ELEMENTS
					    _.each(elements, function(el, i, arr){
					    	var el = Node.get(parseInt(el));
					    	OhmTool.glow(el, true);
			    		});
			    	}, 
			    	function(){
			    		

			    		elements = $(this).attr('data-highlight').split(',');
			    		_.each(elements, function(el, i, arr){
			    			var el = Node.get(parseInt(el));
			    			OhmTool.glow(el, false);
			    		});
			    	}
			    );
		    	scope.dom.append(guide_dom);
		});
	}
}