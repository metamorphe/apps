Validator.RESISTANCE_THRESHOLD = 300;
function Validator(graph){
	this.graph = graph;
	
	var paths = graph.getPathsToGround();
	console.log(paths);
	this.paths = _.map(paths, function(path){
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
	console.log("LEDS", this.leds, "PATHS", this.paths);
}

Validator.prototype = {
	validate: function(){
        errorsA = this.validateLEDsConnectedToGround();
        errorsB = this.validateOhmThreshold();
        errorsC = this.checkIfBatteryExists();
		// console.log(errorsA, errorsB);
        return _.flatten([errorsA, errorsB, errorsC]);
	},
	checkIfBatteryExists: function(){
		r = graph.getSourceNode();
   		s = graph.getSinkNode();
 		if(_.isNull(s) || _.isNull(r)) 
			return [{elements: [], message: "You are missing a power source. Try adding a battery."}];
		else
			return [];
	},
	validateLEDsConnectedToGround: function(){
		var scope = this;
		var errors = [];
	
		var valid = [];
		// console.log("PATHS", this.paths)
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
				// console.log(nodes, led, in_path);
				is_connected = is_connected || in_path >=2;
				if(is_connected) break;
			}
			valid.push(is_connected);
		};
		// console.log(valid);

		errors = _.map(valid, function(v, i, arr){
			if(!v) return {elements: [scope.ledIDs[i]], message: "The LED is not connected to power or ground."}
			else return false;
		});

		// ERROR LED ID, MESSAGE
		return _.compact(errors);
	}, 
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
	validateOhmThreshold: function(){
		var scope = this;
		var errors = [];
		// LOOKING AT ONLY THE POSITIVE SIDE
		var match = this.matchLEDsToPaths();

		// console.log(match);
		positive_segments = _.map(this.leds, function(led, i){
			if(! match[i]) return false;
			var nodes = scope.paths[match[i]];
			var indices = _.map(led, function(terminal, j){
				return nodes.indexOf(terminal);
			});
			positive_segment = nodes.slice(0, _.min(indices) + 1);
			// console.log("INDICES", 0, _.min(indices), indices, nodes, led);
			return positive_segment.join('-');
		});
		// console.log(positive_segments);
		segments = _.map(positive_segments, function(el){
			// console.log(el);
			if(! el) return false;
			return new EllustratePath(el, "#00A8E1");
		});


		// _.each(segments, function(el){
		// 	console.log(el.length);
		// 	paper.project.addChild(el.solution);
		// });

		errors = _.map(segments, function(el, i, arr){
			if(! el) return false;
			ohmage = sr_model.apply(el.solution);
			// console.log(el.length, ohmage);
			if(ohmage > Validator.RESISTANCE_THRESHOLD){
				return {elements: [el.solution.id], message: "You have too much resistance (" + ohmage.toFixed(0) + "Ω) from this line (max= "+ Validator.RESISTANCE_THRESHOLD +"Ω). Try making a shorter path to the red battery terminal."}
			}
			else return false;
		});

		// CALCULATE HOW MUCH RESISTANCE IS ON THAT PATH
		// ERROR, SUBPATH, MESSAGE
		return _.compact(errors);
	}, 
	updateSidePanel: function(errors){
		var dom = $('#debug-guide .list-group');
		dom.html("");	

		if(errors.length == 0){
    		dom.append($('<li class="list-group-item list-group-item-success"> All LEDs connected to battery ground. </li>'));
    		dom.append($('<li class="list-group-item list-group-item-success"> Resistance looks good! </li>'));
    		dom.append($('<li class="list-group-item list-group-item-success"> No overlapping positive/negative paths. </li>'));
		} else{
		_.each(errors, function(el, i, arr){
		    	var err_dom = $('<li class="list-group-item list-group-item-danger">'+ el.message +'</li>');
		    	err_dom.attr('data-highlight', el.elements.join(','));
		    	err_dom.hover(
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
		    	dom.append(err_dom);
			});
		}
	}
}
