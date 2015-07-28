JigExporter = {}
JigExporter = {
	SVG: 0, 
	JSON: 1, 
	PNG: 2, 
	EXPORT_DEFAULT: 0
}

JigExporter.export = function(paper, canvas, mode, downloadFlag){

		var prev = paper.view.zoom;
		paper.view.zoom = 1;
		// default
		var exp;
		

		var filename = $('#filename').val();
		if(_.isUndefined(filename)) filename = "export";
		if(filename == "") filename = "export"; 
		filename = filename.split('.')[0];

		if(_.isUndefined(mode))
			mode = JigExporter.EXPORT_DEFAULT;

		if(_.isUndefined(downloadFlag))
			downloadFlag = true;

		
		if(mode == JigExporter.SVG){
			console.log("Exporting file as SVG");
			exp = paper.project.exportSVG({ 
				asString: true,
				precision: 5
			});
			if(downloadFlag)
				saveAs(new Blob([exp], {type:"application/svg+xml"}), filename + ".svg")
		}
		else if(mode == JigExporter.JSON){

			console.log("Exporting file as JSON");
			exp = paper.project.exportJSON({
				asString: true,
				precision: 5
			});
			if(downloadFlag)
				saveAs(new Blob([exp], {type:"application/json"}), filename + ".json")
		} else if (mode == JigExporter.PNG){
			console.log("Exporting file as JSON");
			paper.view.zoom = 4;
			canvas[0].toBlob(function(blob) {
    			saveAs(blob, filename + ".png");
    		});
			
		}

		paper.view.zoom = prev;

		return exp;
	}

