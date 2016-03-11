function Diode(id){
	this.id = id;
	this.item = Node.get(id);
	this.positive_terminal;
	this.negative_terminal;
	this.terminals;
	this.init();
}

Diode.prototype = {
	init: function(){
		this.positive_terminal = EllustrateSVG.match(this.item, {prefix: ["CVT"]})[0].path;

		if(!_.isUndefined(this.positive_terminal)) this.positive_terminal = this.positive_terminal.terminals[0];
		else this.positive_terminal = [];

		this.negative_terminal = EllustrateSVG.match(this.item, {prefix: ["CGT"]})[0].path; 

		if(!_.isUndefined(this.negative_terminal)) this.negative_terminal = this.negative_terminal.terminals[0];
		else this.negative_terminal = [];

		this.terminals = _.flatten([this.negative_terminal, this.positive_terminal]);
	}, 
	whichPath: function(arrOfPathNodeIDArr){
		var scope = this;
		console.log(arrOfPathNodeIDArr);
		inPaths = _.filter(arrOfPathNodeIDArr, function(nodeIDArray, i){
			return {idx: i, nodes: scope.inPath(nodeIDArray)}
		});
		return _.map(inPaths, function(el){ return el.idx});
	},
	inPath: function(nodeIDArray){
		var is_connected = false;	
		var nodes = nodeIDArray;
		var number_of_terminals_in_path = _.reduce(led, function(memo, terminal){	
			var inside = nodes.indexOf(terminal) > -1;
			if(inside) return memo + 1;
			else return memo;
		}, 0);
		is_connected = number_of_terminals_in_path >= 2;
		
		return is_connected;
	}, 
	getPositivePath: function(nodeIDArray){
		var nodes = nodeIDArray;
		var idx = nodes.indexOf(this.positive_terminal);
		return nodes.slice(0, idx);
	},
	getNegativePath: function(nodeIDArray){
		var nodes = nodeIDArray;
		var idx = nodes.indexOf(this.negative_terminal);
		return nodes.slice(idx, nodes.length - 1);
	}, 
	getPathsToPower: function(){
		r = graph.getSourceNode();
		if(_.isNull(r)) return [];
		
		r = Node.get(r).path.terminals[0];
		r = Node.get(r).node;

		p = this.positive_terminal;
		p = Node.get(p).node;
		
		// console.log("PATH FROM", r.id, p.id)
		results = Graph.printAllPaths(r, p);

		return EllustratePath.sortAndMake(results);
	}, 
	getPathsToGround: function(){
		r = graph.getSinkNode();
		if(_.isNull(r)) return [];
		
		r = Node.get(r).path.terminals[0];
		r = Node.get(r).node;

		n = this.negative_terminal;
		n = Node.get(n).node;
		
		// console.log("PATH FROM", r.id, n.id)
		results = Graph.printAllPaths(r, n);

		return EllustratePath.sortAndMake(results);
	}
}

Validator.RESISTANCE_THRESHOLD = 300;
function Validator(graph){
	this.graph = graph;
	// this.ledIDs = _.map(leds, function(led){
	// 		return led.id;
	// 	});
	// this.leds = _.map(leds, function(el){
	// 	positive_terminal = EllustrateSVG.match(el, {prefix: ["CVT"]})[0].path;
	// 	if(!_.isUndefined(positive_terminal)) positive_terminal = positive_terminal.terminals;
	// 	else positive_terminal = [];

	// 	negative_terminal = EllustrateSVG.match(el, {prefix: ["CGT"]})[0].path; 
	// 	if(!_.isUndefined(negative_terminal)) negative_terminal = negative_terminal.terminals;
	// 	else negative_terminal = [];
	// 	return _.flatten([positive_terminal, negative_terminal]); 
	// });
	// console.log("LEDS", this.leds, "PATHS", this.paths);
}

Validator.prototype = {
	bom: function(){
		var solutions = graph.getPathsToGround();
		this.paths = _.map(solutions, function(path){
			return EllustratePath.toNodesArr(path);
		});
		var leds = EllustrateSVG.get({name:"CP:_circuit_x5F_led_1_"});
		this.diodes = _.map(leds, function(led){
			return new Diode(led.id);
		});
		var total_path_length = _.reduce(solutions, function(memo, el){
			return memo + el.length;
		}, 0);
		total_path_length = Ruler.pts2mm(total_path_length);
		return [
					{level: 3, 
						elements: [], 
						message: "<b>Total path length</b>: "+ total_path_length.toFixed(0)+ " mm"
					}, 
					{level: 3, 
						elements: [], 
						message: "<b># of LEDs</b>: " + leds.length
					}, 
				]
	},
	validate: function(){
		graph.enable();
		bom = this.bom();
        msgsC = this.checkIfBatteryExists();
		
        msgsA = this.validateLEDsConnectedToGround();
        msgsB = this.validateOhmThreshold();
       // console.log(errorsA, errorsB);
        // return _.flatten([errorsC, msgsA, errorsB, ]);
        msgs =  _.flatten([bom, msgsC, msgsA, msgsB]);
      
        this.updateSidePanel(msgs);
        graph.disable();
	},
	checkIfBatteryExists: function(){
		r = graph.getSourceNode();
   		s = graph.getSinkNode();
   		console.log("BATTERY EXISTS", _.isNull(s) || _.isNull(r), r, s)
 		if(_.isNull(s) || _.isNull(r)) 
			return [{level: 5, 
						elements: [], 
						message: "You are missing a power source. Try adding a battery."}];
		else
			return [{level: 6, 
						elements: [], 
						glyph: "check",
						message: "Circuit is powered."}
						];
	},
	validateLEDsConnectedToGround: function(){
		var scope = this;
		console.log("Checking LEDS: " + this.diodes.length)
		
		var powered = _.map(this.diodes, function(diode, i){
			return diode.getPathsToPower();
		});

		var grounded = _.map(this.diodes, function(diode, i){
			return diode.getPathsToGround();
		});

		var errors = _.map(this.diodes, function(diode, i){
			var isGrounded = grounded[i].length > 0;
			var isPowered = grounded[i].length > 0;
			if(! isGrounded || ! isPowered){
				return {level: 5, 
							elements: [diode.id], 
							message: "The LED is not connected to ground or power."
						}

			}

			if(! isGrounded){
				return {level: 5, 
							elements: [diode.id], 
							message: "The LED is not connected to ground."
						}
			}
			if(! isPowered){
				return {level: 5, 
							elements: [diode.id], 
							message: "The LED is not connected to power."
						}
			}

			return false;
		});
		errors = _.compact(errors);
		if(errors.length == 0){
			return [{level: 6, 
							glyph: "check",
							elements: [], 
							message: "All LEDs connected to battery ground."
						}]
		}else{
			return errors;
		}
		
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
				return {level: 5,
							elements: [el.solution.id], 
							message: "You have too much resistance (" + ohmage.toFixed(0) + "Ω) from this line (max= "+ Validator.RESISTANCE_THRESHOLD +"Ω). Try making a shorter path to the red battery terminal."}
			}
			else return false;
		});


		if(errors.length == 0){
			return [{level: 6, 
							glyph: "check",
							elements: [], 
							message: "Resistance looks good!"
						}]
		}
		// CALCULATE HOW MUCH RESISTANCE IS ON THAT PATH
		// ERROR, SUBPATH, MESSAGE
		return _.compact(errors);
	}, 
	updateSidePanel: function(msgs){
		var scope = this;
		var dom = $('#debug-guide .list-group');
		dom.html("");	
		
		// BILL OF MATERIALS
		_.each(msgs, function(el, i, arr){
		   	guideDOM = Validator.generateSidePanelNode(el);
		   	dom.append(guideDOM);
		});
		
	}, 
}


Validator.generateSidePanelNode =  function(el){
				if(el.level == 1) level = "active";
				if(el.level == 2) level = "list-group-item";
				if(el.level == 3) level = "list-group-item-warning";
				if(el.level == 4) level = "list-group-item-info";
				if(el.level == 5) level = "list-group-item-danger";
				if(el.level == 6) level = "list-group-item-success";
		    	

		    	var guide_dom = $('<li class="list-group-item '+ level +'"></li>');
		    	var row = $('<div></div>').addClass("row");
		    	var col_a = $('<div></div>').addClass('col-xs-2');
		    	var col_b = $('<div></div>').addClass('col-xs-10');
		    	if(level == "active"){
		    		col_a = col_b;
		    		row.append(col_a);
		    		col_a.removeClass('col-xs-10').addClass('col-xs-12');
		    	}else
			    	row.append([col_a, col_b]);
		    	guide_dom.append(row);
		    	if(el.icon){
			    	var icon = "icon-" + el.icon;
			    	col_a.prepend("<span class='"+ icon +" guide-icon'></span>");
			    }
			    if(el.glyph){
			    	var glyph = "glyphicon glyphicon-" + el.glyph;
			    	col_a.prepend("<span class='"+ glyph +" guide-icon'></span>");
			    }
			    if(el.debug){
			    	var btnGroup = DOM.tag("div").addClass('btn-group');
			    	// var yesButton = DOM.tag("button").addClass('btn btn-sm btn-success').appendTo(btnGroup);
			    	// var yes = DOM.tag("span").addClass('glyphicon glyphicon-ok').appendTo(yesButton);
			    	var noButton = DOM.tag("button").addClass('btn btn-sm btn-info').appendTo(btnGroup);
			    	var no = DOM.tag("span").addClass('sm-icon-debug').appendTo(noButton);
			    	noButton.click(function(){
			    		var elems = _.map(el.debug, function(g){
			    			return Validator.generateSidePanelNode(g);
			    		});
			    		// console.log(el.debug);
			    		elems = _.each(elems, function(e){
			    			var yesButton = DOM.tag("button").addClass('btn btn-sm btn-success').appendTo(btnGroup);
			    			var yes = DOM.tag("span").addClass('glyphicon glyphicon-ok').appendTo(yesButton);
			    			yesButton.click(function(){
			    				$(this).parent().parent().parent().remove();
			    			});
			    			e.find('.col-xs-10').append(yesButton);
			    		});
			    		$(this).parent().parent().parent().parent().after(elems);
			    		$(this).unbind('click');
			    		$(this).remove();
			 
			    	
			    	});
			    }
			    var msg = DOM.tag("p").html(el.message);
			    col_b.append([msg, btnGroup]); 
			    // console.log("ELEMENT", el);
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
					    elements = _.compact(elements);
					    // LIGHT UP THE ELEMENTS
					    _.each(elements, function(el, i, arr){
					    	var el = Node.get(parseInt(el));
					    	OhmTool.glow(el, true);
			    		});
			    	}, 
			    	function(){
			    		elements = $(this).attr('data-highlight').split(',');
			    		elements = _.compact(elements);
					   
			    		_.each(elements, function(el, i, arr){
			    			var el = Node.get(parseInt(el));
			    			OhmTool.glow(el, false);
			    		});
			    	}
			    );
		    	return guide_dom;
    }