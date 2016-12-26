function PaperUtil() {}
PaperUtil.import = function(filename, options){
	var extension = filename.split('.');
	extension = extension[extension.length - 1];

	if(extension == "svg"){
	 	paper.project.importSVG(filename, function(item) {
	 		item.set(options);
		});
	}
 	else{
		console.log("IMPLEMENTATION JSON IMPORT");
	}
}

PaperUtil.export = function(filename){
	console.log("Exporting SVG...", filename);
    var prev_zoom = paper.view.zoom;
    paper.view.zoom = 1;
    paper.view.update();

    exp = paper.project.exportSVG({ 
      asString: true,
      precision: 5
    });
    saveAs(new Blob([exp], {type:"application/svg+xml"}), filename + ".svg");

    paper.view.zoom = prev_zoom;
    paper.view.update();
}

PaperUtil.fitToViewWithZoom = function(element, bounds){
	var scaleX = element.bounds.width / bounds.width;
	var scaleY = element.bounds.height / bounds.height;
	var scale = _.max([scaleX, scaleY]);
	console.log("SET ZOOM TO", scale);
	paper.view.zoom = 1.0/scale;
}

PaperUtil.getIDs = function(arr){
	return _.chain(arr).map(function(el){
		return PaperUtil.query(paper.project, {id: el});
	}).flatten().compact().value();
}
PaperUtil.getIntersections = function(el, collection){
	var hits = _.map(collection, function(c){
		return c.getIntersections(el);
	});
	hits = _.compact(hits);
	hits = _.flatten(hits);
	return hits;
}



PaperUtil.query = function(container, selector){
	// Prefix extension
	if ("prefix" in selector){
		var prefixes = selector["prefix"];

		selector["name"] = function(item){
			var p = PaperUtil.getPrefixItem(item);
			return prefixes.indexOf(p) != -1;
		}
		delete selector["prefix"];
	}
	else if ("pname" in selector){
		var prefixes = selector["pname"];

		selector["name"] = function(item){
			var p = PaperUtil.getNameItem(item);
			return prefixes.indexOf(p) != -1;
		}
		delete selector["pname"];
	}


	var elements = container.getItems(selector);
	elements = _.map(elements, function(el, i, arr){
		if(el.className == "Shape"){
			nel = el.toPath(true);
			el.remove();
			return nel;
		}
			
		else return el;
	});
	return elements;
}

PaperUtil.queryName = function(selector){
   return PaperUtil.query(paper.project, {pname: [selector]});
}

PaperUtil.queryPrefix = function(selector) {
	return PaperUtil.query(paper.project, {prefix: [selector]});
}

PaperUtil.queryIDs = function(selector) {
	return _.map(selector, function(id){
		return PaperUtil.queryID(id);
	})
}

PaperUtil.queryID = function(selector) {
	var result = PaperUtil.query(paper.project, {id: selector})
	return result.length == 0 ? null : result[0];
}

PaperUtil.queryPrefixWithId = function(selector, id) {
	return _.where(PaperUtil.queryPrefix(selector),
					{lid: id});
}

PaperUtil.set = function(arr, property, value){
	if(typeof(property) == "object"){
		_.each(arr, function(el){
			for(k in property){
				value = property[k];
				el[k] = value;
			}
		});
	}
	else
	_.each(arr, function(el){
	  el[property] = value;
	});
}


PaperUtil.call = function(collection, calling){
	_.each(collection, function(rt){
	  rt[calling]();
	});
}
        



PaperUtil.getPrefix = function(item){
	if(_.isUndefined(item)) return "";
	if(_.isUndefined(item.name)) return "";
	// if(item.name.split(":").length < 2) return "";
	if(item.name.split(":").length < 2) return "";
	return item.name.split(":")[0].trim();
}

PaperUtil.getPrefixItem = function(item){
	if(_.isUndefined(item)) return "";
	if(item.split(":").length < 2) return "";
	return item.split(":")[0].trim();
}


PaperUtil.getName = function(item){
	if(_.isUndefined(item)) return "";
	if(_.isUndefined(item.name)) return "";
	if(item.name.split(":").length < 2) return "";
  	return item.name.split(":")[1].trim();
}

PaperUtil.getNameItem = function(item){
	if(_.isUndefined(item)) return "";
	if(item.split(":").length < 2) return "";
  	return item.split(":")[1].trim();
}

