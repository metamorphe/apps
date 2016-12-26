var v;
// ViewManager.js
function ViewManager(container){
	this.container = container;
	this.view = GET().mode;
	this.last_view = "DRAW";
	this.graph = null;
}

ViewManager.getElements = function() {
	return {
			//positive
			p_paths: PaperUtil.queryPrefix('CVP'),
			p_terminals: PaperUtil.queryPrefix('CVT'),
			p_blobs: PaperUtil.queryPrefix('CVB'),
			// neutral
			n_paths: PaperUtil.queryPrefix('CNP'),
			n_terminals: PaperUtil.queryPrefix('CNT'),
			n_blobs: PaperUtil.queryPrefix('CNB'),
			// negative
			g_paths: PaperUtil.queryPrefix('CGP'),
			g_terminals: PaperUtil.queryPrefix('CGT'),
			g_blobs: PaperUtil.queryPrefix('CGB'),
			// power
			ground: PaperUtil.queryPrefix('CGTB'),
			voltage: PaperUtil.queryPrefix('CVTB'),
			// materials
			conductive_thread: PaperUtil.query(paper.project, {material: "conductive_thread"}),
			copper_tape: PaperUtil.query(paper.project, {material: "copper_tape"}),
			silver_ink: PaperUtil.query(paper.project, {material: "silver_ink"}),
			graphite_paint: PaperUtil.query(paper.project, {material: "graphite_paint"}),
			// 
			components: PaperUtil.queryPrefix('CP'),
			art: PaperUtil.queryPrefix('ART'),
			// 
			construction: PaperUtil.queryPrefix('NCB'),
	}
}


ViewManager.prototype = {
	setView: function(view){
		this.view = view;
		this.update();
	},
	getView: function(){
		return this.view.toUpperCase();
	},
	update: function(){
		var view = this.getView();
		var bg_color = ViewManager.modes[view].color;

		// DOM UPDATE
		var dom_remove = _.chain(ViewManager.modes).reject(function(k, v){ return v == view; }).map(function(el){ return el.dom; }).flatten().value();
		var dom_add = ViewManager.modes[view].dom;
		var dom_remove = _.difference(dom_remove, dom_add);
		dom_remove.push('#alerter');
		$(dom_remove.join(',')).hide();
		$(dom_add.join(',')).show();
		// END DOM UPDATE

		
		if(this.last_view != view){ 
			this.last_view = view; 
			sm.selection = []; 
			sm.update();
		}

		e = ViewManager.getElements();
		var all = [e.art, e.diff, e.leds, e.bo, e.bi, e.cp, e.dds, e.mc, e.base, e.wires];
		$('#interface-container').css("background", bg_color);

		switch(view){
			case "DRAW":
      			this.graph = null;
				// var conductive_fill = ["CGB", "CVB", "CNB", "CGT", "CVT", "CNT", "CVTB", "CGTB"];
				// var conductive_stroke = ["CGP", "CNP", "CVP"];
				// var conductive_fill = PaperUtil.query(paper.project, { prefix: conductive_fill });
				// var conductive_stroke = PaperUtil.query(paper.project, { prefix: conductive_stroke });
				
				// PaperUtil.set(conductive_fill, { fillColor: "#111", strokeWidth: 0});
				// PaperUtil.set(conductive_stroke, { strokeColor: "#111"});
				// MATERIAL UPDATE
				_.each(ViewManager.MATERIALS, function(v, k){
					console.log("Updating", k)
					var elements = PaperUtil.queryName(k);
					PaperUtil.set(_.reject(elements, function(el){ return el.closed;}), v.style.stroke)
					PaperUtil.set(_.filter(elements, function(el){ return el.closed;}), v.style.blob)
				})

				break;	
			case "DRAW_CIRCUIT":
				this.graph = null;
				// PaperUtil.set(PaperUtil.queryPrefix("CP"))
				var negative_fill = [e.ground, e.g_terminals, e.g_blobs];
				var negative_strokes = [e.g_paths];

				var positive_fill = [e.voltage, e.p_terminals, e.p_blobs];
				var positive_strokes = [e.p_paths];

				var neutral_fill = [e.n_terminals, e.n_blobs];
				var neutral_strokes = [e.n_paths];

				PaperUtil.set(_.flatten(positive_fill), {shadowBlur: 0, fillColor: ViewManager.POSITIVE, polarity: ViewManager.POSITIVE});
				PaperUtil.set(_.flatten(positive_strokes), {shadowBlur: 0, strokeColor: ViewManager.POSITIVE, polarity: ViewManager.POSITIVE});

				PaperUtil.set(_.flatten(negative_fill), {shadowBlur: 0, fillColor: ViewManager.NEGATIVE, polarity: ViewManager.NEGATIVE});
				PaperUtil.set(_.flatten(negative_strokes), {shadowBlur: 0, strokeColor: ViewManager.NEGATIVE, polarity: ViewManager.NEGATIVE});

				PaperUtil.set(_.flatten(neutral_fill), {shadowBlur: 0, fillColor: ViewManager.NEUTRAL, polarity: ViewManager.NEUTRAL});
				PaperUtil.set(_.flatten(neutral_strokes), {shadowBlur: 0, strokeColor: ViewManager.NEUTRAL, polarity: ViewManager.NEUTRAL});

				break;	
			case "VALIDATE":
				if(!this.graph)
					this.graph = new Graph(); 
				v = new Validator(this.graph);
				v.validate();
				
				break;	
			case "MAKE":
				if(!this.graph)
					this.graph = new Graph(); 
				f = new FabGuide(this.graph);
				f.fabricate();		
				break;	
			default:
				break;
		}
		paper.view.update();
	}
}
