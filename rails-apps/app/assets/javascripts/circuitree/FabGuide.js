
function FabGuide(graph){
	this.graph = graph;
	this.dom = $('#fab-guide .list-group');
	this.diodes = Diode.grabDiodes(this.graph);
	this.battery = paper.project.getItems({name: "CP:_Battery"})[0];
	this.battery.opacity = 0;
	_.each(this.diodes, function(diode){
		diode.item.opacity = 0;
	})
	_.each(PaperUtil.queryPrefix("NODE"), function(node){
		node.opacity = 0;
	})
	this.graph.colorPathsBlack();

}

FabGuide.prototype = {
	fabricate: function(){
        this.updateSidePanel();
        $($(".list-group-item.active")[0]).removeClass('disabled');
        list = $($(".list-group-item.active")[0]).nextAll();
		i = 0;
		while(i < list.length && !$(list[i]).hasClass('active')){
			$(list[i]).removeClass('disabled');
			i++;
		}
 	},
	updateSidePanel: function(){
		var scope = this;
		this.dom.html("");	

		var powered = _.pluck(this.diodes, "power_routes");
		var grounded = _.pluck(this.diodes, "ground_routes");
		var all_sink_source_paths = _.flatten([this.graph.getSourceNode().edges, this.graph.getSinkNode().edges])


		var ptgs = _.map(this.diodes, function(diode, i){
			powered_path = powered[i][0];
			grounded_path = grounded[i][0];
			return {length: powered_path.length + grounded_path.length, powered: powered_path, grounded: grounded_path, diode: diode, all_paths: all_sink_source_paths};
		});
		// shortest trace first
		ptgs = _.sortBy(ptgs, function(el){ return el.length;})
	

		var guides = _.map(ptgs, function(el, i, arr){
			dryingtime = 45;
			p_ohmage = sr_model.apply(el.powered.solution);
			n_ohmage = sr_model.apply(el.grounded.solution);
			
			p_ohmage_upperbound = 2 * p_ohmage; 
			n_ohmage_upperbound = 2 * n_ohmage; 
			p_ohmage_upperbound = p_ohmage_upperbound.toFixed(0);
			n_ohmage_upperbound = n_ohmage_upperbound.toFixed(0);

			var sourceNode = scope.graph.getSourceNode()[0].id;
			var sinkNode = scope.graph.getSinkNode()[0].id;

			
					// 	led_terminals = scope.leds[i];
		// 	// console.log("HGO", scope.ledIDs, scope.leds, led_terminals);
			var guide = [];
			if(i == 0){
				alltracesoutofbattery = _.flatten(_.map(ptgs, function(temp){ return [temp.powered.mini_solution.id, temp.grounded.mini_solution.id]}));
				guide.push(
					[{level: 1, 
						icon: "",
						elements: [], 
						message: "<b>STEP #" + 1 + ": ATTACH BATTERY </b>"},
					{level: 2, 
						icon: "pen",
						elements: alltracesoutofbattery, 
						message: "Draw all the traces coming out of your battery with your silver ink pen."},
					{level: 2, 
						icon: "place",
						elements: [scope.battery.id], 
						message: "Add the battery."},
					{level: 3, 
						icon: "multimeter",
						multimeter: "voltage", 
						probeA: sourceNode, probeB: sinkNode, elements: alltracesoutofbattery, 
						message: "<b class='check'>Power Check</b>: For all paths, position and <em>match</em> your probes to the dots. Is the reading approximately <b>3.3 V</b>?  ",
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

			
			var timer_updatedfied = DOM.tag("span").addClass("timer-uf").html(dryingtime);
			var timer_html = timer_updatedfied.wrap("<div>").parent().html();

			// new Timer(seconds, updatefield);

			var drawable_paths = _.flatten([el.powered.solution.id, el.grounded.solution.id, el.all_paths]);
			console.log(el.diode.negative_terminal)
			guide.push(
				[
				{level: 1, 
					icon: "",
					elements: [], 
					message: "<b>STEP #" + (i+ 2) + ": DRAW BRANCH </b>"},
				{level: 2, 
					icon: "pen",
					elements: drawable_paths, 
					message: "Draw Trace #" + (i+ 1) + " with your silver ink pen."},
				{level: 2, 
					icon: "clock",
					elements: drawable_paths, 
					message: "Let these traces dry for <b>"+ timer_html +" seconds</b>.", 
					time: dryingtime },
				{level: 3,
					icon: "multimeter", 
					multimeter: "resistance", 
					probeA: el.powered.nodes[0].id, 
					probeB: el.diode.positive_terminal[0].id,  
					elements: [el.powered.solution.id, el.powered.mini_solution.id], 
					message: "<b class='check'>Resistance Check</b>: Position and <em>match</em> your probes to the dots. Is the reading <b>less than " + p_ohmage_upperbound + " Ω</b>? ",
					debug: [
							{level: 4,
								icon: "eye", 
								elements: [el.powered.solution.id, el.powered.mini_solution.id], 
								message: "Too high resistance? Add more silver ink to widen your line."}
						]
					},
				
				{level: 3,
					icon: "multimeter", 
					multimeter: "resistance", 
					probeA: el.grounded.nodes[0].id, 
					probeB: el.diode.negative_terminal[0].id,  
					elements: [el.grounded.solution.id, el.grounded.mini_solution.id], 
					message: "<b class='check'>Resistance Check</b>: Position and <em>match</em> your probes to the dots. Is the reading <b>less than " + n_ohmage_upperbound + " Ω</b>? ",
					debug: [
							{level: 4,
								icon: "eye", 
								elements: [el.grounded.solution.id, el.grounded.mini_solution.id], 
								message: "Let it dry a little longer and check again."
							}
						]
					},
				{level: 2, 
					icon: "place",
					elements: [el.diode.id], 
					message: "Place the following LED. Pay attention to orientation."},
				{level: 3, 
					icon: "eye",
					elements: [el.diode.id], 
					message: "Do the LED(s) turn on?", 
				debug: [
						{level: 4,
							icon: "eye", 
							elements: [el.diode.id], 
							message: "Press the LED(s) down with more pressure."}
						],
				}
				
				]
			);
		timer_updatedfied.unwrap();
		// 	// LEAVE BATTERY ON IF ITS THE LAST ONE
		// 	// if(arr.length - 1 == i) guide = guide.slice(0, guide.length - 1);
			return _.flatten(guide);
		});

		var traces = ["CGP", "CVP", "CNP", "TGP", "TVP", "TNP"];
		traces = PaperUtil.query(paper.project, { prefix: traces });
		traces = _.pluck(traces, "id");
		// var hue = 30;
		// _.each(traces, function(trace){
		// 	trace.set({
		// 		strokeColor: "#333", 
		// 		strokeWidth: 2, 
		// 		opacity: 0
		// 	});
		// })

		guides.push([
			{level: 1, 
					icon: "",
					elements: [], 
					message: "<b>DRAWING</b>"},
			{level: 2, 
				icon: "pen",
				elements: traces, 
				message: "Draw the rest of your circuit! :)"}
			]
		);

		guides = _.flatten(guides);
		this.setGuides(guides);	
		paper.view.update();
	}, 
	setGuides: function(guides){
		var scope = this;
		_.each(guides, function(el, i, arr){
			guides = Validator.generateSidePanelNode(el, disabled=true);

			scope.dom.append(guides)
		});
		$('.timer').each(function(i, el){
			// console.log(i, el);
			$(el).click(function(e){
				var uf = $(this).parent().parent().find('.timer-uf');
				var t =  parseInt($(this).attr('data-time'));
				// console.log("Starting timer for", t, uf);
				
				var timer = new Timer(t, uf);
				timer.start();
			});
		});
	}
}