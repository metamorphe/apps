function PaperSetup(){

}
PaperSetup.types = {
	A4: {
			vertical: { 
			  width: 210, 
			  height: 297
			},
			horizontal: { 
			  width: 297, 
			  height: 210
			}
		}
}

PaperSetup.makePaper = function(paper_type){
	var surface = new paper.Group({
		name: "NCB: artboard", 
		position: paper.view.center, 
		canvasItem: true
	});
	var p = paper.Path.Rectangle({
		parent: surface,
		width: Ruler.mm2pts(paper_type.width),
		height: Ruler.mm2pts(paper_type.height),
		fillColor: "white", 
		shadowColor: new paper.Color(0.8),
		shadowBlur: 10,
		shadowOffset: new paper.Point(0, 0)
	});
	var label = new paper.PointText({
		parent: surface, 
		justification: "right",
		content: "A4",
		fillColor: 'gray', 
		fontFamily: 'Arial', 
		fontWeight: 'bold', 
		fontSize: 20
	});
	var h = label.bounds.height;
	var w = label.bounds.width;
	label.set({
		position: p.bounds.topRight.add(new paper.Point(-10 - w, 10 + h))
	})
	surface.set({
		position: paper.view.center
	});
	return surface;
}
