ViewManager.CANVAS_COLOR = "rgb(245, 244, 240)";


ViewManager.POSITIVE = new paper.Color("red");
ViewManager.NEGATIVE = new paper.Color("black");
ViewManager.NEUTRAL = new paper.Color("#CCC");

ViewManager.GRAPHITE_PAINT = {
	name: "graphite_paint",
	img: "/materials/GraphitePaint.png",
	strokeWidthRange: [1, 10], 
	strokeWidthFixed: false,
	defaultStrokeWidth: 8,
	sheetResistance: 0.5,
	style: {
		blob:{
			fillColor: new paper.Color("#333"), 
			dashArray:[], 
			strokeWidth: 0,
			shadowColor: new paper.Color(0.8),
			shadowBlur: 0,
			shadowOffset: new paper.Point(0, 0)
		}, 
		stroke:{
			strokeColor: new paper.Color("#333"), 
			dashArray:[], 
			shadowColor: new paper.Color(0.8),
			shadowBlur: 0,
			shadowOffset: new paper.Point(0, 0)
		}
	}
}

ViewManager.SILVER_INK = {
	name: "silver_ink",
	img: "/materials/SilverInk.png",
	strokeWidthRange: [1, 10], 
	strokeWidthFixed: false,
	defaultStrokeWidth: 2,
	sheetResistance: 0.5,
	style: {
		blob:{
			fillColor: new paper.Color("#839CA5"), 
			dashArray:[], 
			strokeWidth: 0,
			shadowColor: new paper.Color(0.8),
			shadowBlur: 0,
			shadowOffset: new paper.Point(0, 0)
		}, 
		stroke:{
			strokeColor: new paper.Color("#839CA5"), 
			dashArray:[], 
			shadowColor: new paper.Color(0.8),
			shadowBlur: 0,
			shadowOffset: new paper.Point(0, 0)
		}
	}
}
ViewManager.COPPER_TAPE = {
	name: "copper_tape",
	img: "/materials/CopperTape.png",
	strokeWidthRange: [10], 
	strokeWidthFixed: true,
	defaultStrokeWidth: Ruler.mm2pts(12),
	sheetResistance: 0.5,
	style: {
		blob:{
			fillColor: new paper.Color("#B87333"), 
			dashArray:[], 
			strokeWidth: 0,
			shadowColor: new paper.Color(0.8),
			shadowBlur: 0,
			shadowOffset: new paper.Point(0, 0)
		}, 
		stroke:{
			strokeColor: new paper.Color("#B87333"), 
			dashArray:[], 
			shadowColor: new paper.Color(0.8),
			shadowBlur: 0,
			shadowOffset: new paper.Point(0, 0)
		}
	}
}

ViewManager.CONDUCTIVE_THREAD = {
	name: "conductive_thread",
	img: "/materials/ConductiveThread.png",
	strokeWidthRange: [2], 
	strokeWidthFixed: true,
	sheetResistance: 0.5,
	defaultStrokeWidth: 1,
	style: {
		blob:{
			fillColor: new paper.Color("#666666"), 
			// dashArray:[10, 12], 
			strokeWidth: 0,
			shadowColor: new paper.Color(0.8),
			shadowBlur: 0,
			shadowOffset: new paper.Point(0, 0)
		}, 
		stroke:{
			strokeColor: new paper.Color("#666666"), 
			dashArray:[10, 12], 
			shadowColor: new paper.Color(0.8),
			shadowBlur: 0,
			shadowOffset: new paper.Point(0, 0)
		}
	}
}
ViewManager.MATERIALS = {
	silver_ink: ViewManager.SILVER_INK,
	copper_tape: ViewManager.COPPER_TAPE, 
	conductive_thread: ViewManager.CONDUCTIVE_THREAD, 
	graphite_paint: ViewManager.GRAPHITE_PAINT
}

ViewManager.currentMaterial = ViewManager.MATERIALS.silver_ink;


ViewManager.modes = {
    DRAW: {color: "rgb(92, 184, 92)", dom: ['#save-actions','#redo', '#add-library', '#system-messages', '#history-bar', '#canvas-toolbox', '#big-undo', '#clear-canvas-and-history',  '#circuit-toolbox', '#on-it']}, 
    DRAW_CIRCUIT: {color: "rgb(92, 184, 92)", dom: ['#save-actions', '#redo','#add-library', '#system-messages', '#history-bar', '#canvas-toolbox', '#big-undo', '#clear-canvas-and-history',  '#circuit-toolbox', '#on-it']}, 
    VALIDATE: {color:"rgb(66, 139, 202)", dom: ['#debug-guide']}, 
    MAKE: {color:"rgb(145, 61, 136)", dom: ['#fab-guide']}, 
  };