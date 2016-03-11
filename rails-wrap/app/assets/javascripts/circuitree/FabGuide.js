
function FabGuide(graph){
	this.dom = $('#fab-guide .list-group');
	this.ptgs = graph.getPathsToGround();
	this.ptgs = _.sortBy(this.ptgs, function(ptg){ return ptg.length;});
	this.ptgs = _.uniq(this.ptgs, function(ptg){ 
		return (ptg.length / 30).toFixed(0);
	});
	this.ptgs = _.each(this.ptgs, function(ptg, i){ 
		console.log(i, ptg.length)
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
	console.log("LED Termins", this.leds);
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
			// console.log("HGO", scope.ledIDs, scope.leds, led_terminals);
			var guide = [];
			if(i == 0){
				guide.push(
					[{level: 1, 
						icon: "",
						elements: [], 
						message: "<b>STEP #" + 1 + ": ATTACH BATTERY </b>"},
					{level: 2, 
						icon: "pen",
						elements: [el.solution.id], 
						message: "Draw all the traces coming out of your battery with your silver ink pen."},
					{level: 2, 
						icon: "place",
						elements: [scope.battery.id], 
						message: "Add the battery."},
					{level: 3, 
						icon: "multimeter",
						multimeter: "voltage", 
						probeA: led_terminals[0], probeB: led_terminals[1], elements: [el.solution.id], 
						message: "<b class='check'>Power Check</b>: For all paths, position your probes on the dots. Is the reading approximately <b>3.3 V</b>? (YES | NO) ",
						debug: [
							{level: 4,
								icon: "", 
								elements: [scope.battery.id], 
								message: "Press the battery down with more pressure."
							}
						]
					}
					
					]
				);
			}

			guide.push(
				[
				{level: 1, 
					icon: "",
					elements: [], 
					message: "<b>STEP #" + (i+ 2) + ": DRAW BRANCH </b>"},
				{level: 2, 
					icon: "pen",
					elements: [el.solution.id], 
					message: "Draw Trace #" + (i+ 1) + " with your silver ink pen."},
				{level: 2, 
					icon: "clock",
					elements: [el.solution.id], 
					message: "Let these traces dry for <b>"+ dryingtime +" seconds</b>.", 
					time: dryingtime },
				{level: 3,
					icon: "multimeter", 
					multimeter: "resistance", 
					probeA: el.nodes[0], 
					probeB: led_terminals[0],  
					elements: [el.solution.id], 
					message: "<b class='check'>Resistance Check</b>: Position your probes on the dots. Is the reading less than <b>" + ohmage_upperbound + " Ω</b>? (YES | NO )",
					debug: [
							{level: 4,
								icon: "eye", 
								elements: [el.solution.id], 
								message: "Let it dry a little longer and check again."}
						]
					},
				
				{level: 3,
					icon: "multimeter", 
					multimeter: "resistance", 
					probeA: el.nodes[0], 
					probeB: led_terminals[0],  
					elements: [el.solution.id], 
					message: "<b class='check'>Resistance Check</b>: Position your probes on the dots. Is the reading less than <b>" + ohmage_upperbound + " Ω</b>? (YES | NO )",
					debug: [
							{level: 4,
								icon: "eye", 
								elements: [el.solution.id], 
								message: "Let it dry a little longer and check again."
							}
						]
					},
				{level: 2, 
					icon: "place",
					elements: [scope.ledIDs[scope.match[i]]], 
					message: "Place the following LED."},
				{level: 3, 
					icon: "eye",
					elements: [scope.ledIDs[scope.match[i]]], 
					message: "Do the LED(s) turn on?", 
				debug: [
						{level: 4,
							icon: "eye", 
							elements: [scope.ledIDs[scope.match[i]]], 
							message: "Press the LED(s) down with more pressure."}
						],
				}
				
				]
			);
			// LEAVE BATTERY ON IF ITS THE LAST ONE
			// if(arr.length - 1 == i) guide = guide.slice(0, guide.length - 1);
			return _.flatten(guide);
		});
		guides = _.flatten(guides);
		this.setGuides(guides);	
	}, 
	setGuides: function(guides){
		var scope = this;
		_.each(guides, function(el, i, arr){
			Validator.generateSidePanelNode(scope.dom, el);
		});
	}
}