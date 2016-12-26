
var EPSILON = 2;
solutions = null;
Graph.NODE_HIT_TEST_RADIUS = 5;

function Graph(){
	this.className = "Graph";
	this.nodes = [];
	// this.breakUpSelfIntersections();
	this.breakUpIntersections();
	this.generateBlobPaths();
	this.colorPaths();
	console.log("DONE POST-PROCESSING");
	this.init();
}


var intersectionNodes = [];
Graph.prototype = {
	init: function(){
		this.processEnds();
	},
	processEnds: function(){
		console.log('----------------');
		var start = new Date().getTime();
		console.log("PROCESSING ENDS");
		var scope = this;
		var conductive= ["CGP", "CVP", "CNP"];

		conductive_traces = PaperUtil.query(paper.project, { prefix: conductive });
		var before = conductive_traces.length;
		console.log("\t", before, "TRACES TO PROCESS");
		var scope = this;

		var traces = ["CGP", "CVP", "CNP", "TGP", "TVP", "TNP"];
		traces = PaperUtil.query(paper.project, { prefix: traces });
		_.each(traces, function(trace){
			trace.head_processed = false;
			trace.tail_processed = false;
		});


		// add nodes to the ends
		_.chain(traces).each(function(trace){
			// console.log("Processing trace", trace.id)
			if(trace.length != 0){
				if(!trace.head_processed){
					var head = trace.getPointAt(0).clone();
					var hit_test = new paper.Path.Circle({
						parent: PaperUtil.queryPrefix("ELD")[0],
						name: "NODE: temp", 
						position: head,
						radius: Graph.NODE_HIT_TEST_RADIUS, 
						fillColor:  "#00A8E1", 
					});
					var hits = PaperUtil.getIntersections(hit_test, traces);
					var hits = _.chain(hits).map(function(hit){ 
						var offset = hit.offset;
						if(hit.path.length -  offset > offset) hit.path.head_processed = true;
						else hit.path.tail_processed = true;
						return hit.path.id; 
					}).uniq().value();
					hit_test.edges = hits;
				}
				if(!trace.tail_processed){
					var tail = trace.getPointAt(trace.length).clone();
					var hit_test = new paper.Path.Circle({
						parent: PaperUtil.queryPrefix("ELD")[0],
						name: "NODE: temp", 
						position: tail,
						radius: Graph.NODE_HIT_TEST_RADIUS, 
						fillColor:  "#00A8E1"
					});
					var hits = PaperUtil.getIntersections(hit_test, traces);
					var hits = _.chain(hits).map(function(hit){ 
						var offset = hit.offset;
						if(hit.path.length -  offset > offset) hit.path.head_processed = true;
						else hit.path.tail_processed = true;
						return hit.path.id; 
					}).uniq().value();

					hit_test.edges = hits;
				}
			}
		}).value();
		nodes = PaperUtil.queryPrefix("NODE");
		_.each(traces, function(trace){
			node_edges = _.filter(nodes, function(node){ 
				return node.edges.indexOf(trace.id) > -1 
			});
			trace.edges = _.pluck(node_edges, "id")
		});
		
		conductive_traces = PaperUtil.query(paper.project, { prefix: conductive });
		var after = conductive_traces.length;
		console.log("\t", after, "(+" + (after - before) + ")", "TRACES TO PROCESS");
		console.log("NUMBER OF NODES", PaperUtil.queryPrefix("NODE").length);
		console.log("END SELF_INTERSECTIONS PROCESSING");
		var end = new Date().getTime();
		var time = end - start;
		console.log('%cSELF_INTERSECTION EXECUTION TIME: ' + time +  " ms", 'font-weight: bold; color: #111');
		console.log('----------------');		
	},
	colorPaths: function(){
		var traces = ["CGP", "CVP", "CNP", "TGP", "TVP", "TNP"];
		traces = PaperUtil.query(paper.project, { prefix: traces});

		var hue = 30;
		_.each(traces, function(trace){
			var c = new paper.Color("red");
			c.hue = hue;
			trace.set({
				strokeColor: new paper.Color(0.9), 
				// strokeColor: c, 
				strokeWidth: 4
			});
			hue += 20;
		})
	},
	colorPathsBlack: function(){
		var traces = ["CGP", "CVP", "CNP", "TGP", "TVP", "TNP"];
		traces = PaperUtil.query(paper.project, { prefix: traces});

		var hue = 30;
		_.each(traces, function(trace){
			trace.set({
				strokeColor: "#333", 
				strokeWidth: 2, 
				opacity: 0
			});
		})
	},
	find: function(id){
		return _.filter(graph.nodes, function(el, i, arr){ return el.id == id})[0];
	},
	enable: function(){
		_.each(this.nodes, function(node){
			node.enable();
		});
		paper.view.update();
	},
	disable: function(){
		_.each(this.nodes, function(node){
			node.disable();
		});
		paper.view.update();
	},
	removeNodes: function(removeThese){
		this.nodes = _.reject(this.nodes, function(node){
			
			var marked = removeThese.indexOf(node.id) > -1
			if(marked){
				// console.log("DELETING", node.id)
				node.self.remove();
				delete node;
			}
			return marked;
		});
	},
	breakUpSelfIntersections: function(){
		console.log('----------------');
		var start = new Date().getTime();
		console.log("PROCESSING SELF INTERSECTIONS");
		var scope = this;
		var conductive= ["CGP", "CVP", "CNP"];

		conductive_traces = PaperUtil.query(paper.project, { prefix: conductive });
		var before = conductive_traces.length;
		console.log("\t", before, "TRACES TO PROCESS");
		var returned = 0;
		var ids = _.map(conductive_traces, function(trace, i){
			console.log("COMPUTING INTERSECTIONS", trace.id)
			var to_id = setTimeout(function(){
				self_ixt = trace.getIntersections(trace);
				console.log("\t\t#", i, "(id", trace.id ,"):", self_ixt.length, "SELF_INTERSECTIONS");
				_.each(self_ixt, function(ixt){
					var path = ixt._curve.path;
					var point = ixt._point;
					var offsetBeforeLoop = path.getOffsetOf(point);
					var loop = path.split(offsetBeforeLoop);
					
					if(loop){
							black_magic = loop.clone();
							black_magic_2 = black_magic.split(1);
							if(black_magic_2){
								offsetPostLoop = black_magic_2.getOffsetOf(point);
								black_magic_2.remove();
								black_magic.remove();
								// end of magic
								var end_of_path = loop.split(offsetPostLoop);
								if(end_of_path){
									start_of_path = path;
									var ids = [start_of_path.id, end_of_path.id, loop.id]
								}
							}
						}

				});
				returned++;
			}, 3000);
			return to_id;	
		});
		while(returned != ids.length){
			// wait for locks to return
			console.log("Processing...", returned, ids.length);
		}
		conductive_traces = PaperUtil.query(paper.project, { prefix: conductive });
		var after = conductive_traces.length;
		console.log("\t", after, "(+" + (after - before) + ")", "TRACES TO PROCESS");
		console.log("END SELF_INTERSECTIONS PROCESSING");
		var end = new Date().getTime();
		var time = end - start;
		console.log('%cSELF_INTERSECTION EXECUTION TIME: ' + time +  " ms", 'font-weight: bold; color: #111');
		console.log('----------------');
	},
	breakUpIntersections: function(){
		console.log('----------------');
		var start = new Date().getTime();
		console.log("PROCESSING INTERSECTIONS");
		var scope = this;
		var conductive = ["CGP", "CVP", "CNP"];
		conductive_traces = PaperUtil.query(paper.project, { prefix: conductive });
		var before = conductive_traces.length;
		console.log("\t", before, "TRACES TO PROCESS");

		cuts = [];
		_.each(conductive_traces, function(trace, i){
			trace.self = true;	
			traces = PaperUtil.query(paper.project, { prefix: conductive });
			traces = _.reject(traces, function(tr){
				return tr.self || tr.processed;
			});
			intersects = PaperUtil.getIntersections(trace, traces);	
			// console.log("\t\t#", i, "(id", trace.id ,"):", intersects.length, "INTERSECTIONS FOUND", "n=", traces.length);
					
			trace.processed = true;


			_.each(intersects, function(ixt){
				var pathIn = ixt._curve.path;
				var pathOut = ixt._curve2.path;
				var point = ixt.point.clone();
				var pointA = pathIn.getNearestPoint(point);
				var offsetA = pathIn.getOffsetOf(pointA);
				var pointB = pathOut.getNearestPoint(point);
				var offsetB = pathOut.getOffsetOf(pointB);

				if(offsetA && scope.isValidSplitLocation(pathIn, offsetA))
					cuts.push({point: point.clone(), path: pathIn.id, offset: offsetA});
				if(offsetB && scope.isValidSplitLocation(pathOut, offsetB))
					cuts.push({point: point.clone(), path: pathOut.id, offset: offsetB});
					
			});
			trace.self = false;		
		});
		
		cuts = _.groupBy(cuts, function(el, i, arr){
			return el.path;
		});
		
		_.each(cuts, function(el, pathID){
			var pathID = parseInt(pathID);
			var offsets = _.sortBy(_.pluck(el, "offset"));
			// console.log("CUT LOCATIONS", pathID, offsets)
			var created = scope.splitPathAtOffsets(PaperUtil.queryID(pathID), offsets);
			// console.log("CREATED PATHS", created);
		});

		conductive_traces = PaperUtil.query(paper.project, { prefix: conductive });
		var after = conductive_traces.length;
		console.log("\t", after, "(+" + (after - before) + ")", "TRACES TO PROCESS");

		console.log("END INTERSECTIONS PROCESSING");
		var end = new Date().getTime();
		var time = end - start;
		console.log('%cINTERSECTIONS EXECUTION TIME: ' + time +  " ms", 'font-weight: bold; color: #111');
		console.log('----------------');
	},
	generateBlobPaths: function(){
		console.log('----------------');
		var start = new Date().getTime();
		console.log("PROCESSING BLOB_CONNECTION ROUTINE");		

		var scope = this;
		var traces_p = ["CGP", "CVP", "CNP"];		
		var blobs_p = ["CGB", "CVB", "CNB", "CGT", "CVT", "CNT", "CNTB", "CVTB", "CGTB"];
		blobs = PaperUtil.query(paper.project, { prefix: blobs_p });
		traces = PaperUtil.query(paper.project, { prefix: traces_p });

		var before_b = blobs.length;
		var before_t = traces.length;
		console.log("\t", before_b, "BLOBS TO PROCESS");
		console.log("\t", before_t, "TRACES TO PROCESS");

		// HIGH LEVEL For every trace, find where trace intersect with a blob. 
		// Split the trace appropriately
		// Remove the traces that exist inside a blob
		// Extend remaining to the center of blobs

		var these_traces_survived_the_purge = _.map(traces, function(trace, i, arr){
			// console.log("\t\t PROCESSING TRACE", trace.id);

			ixts = PaperUtil.getIntersections(trace, blobs);
			ixts =  _.chain(ixts).map(function(ixt){
				var path = ixt._curve2.path;
				var pt = path.getNearestPoint(ixt.point);
				var offset = path.getOffsetOf(pt);
				path.strokeColor = "yellow";
				return {offset: offset, blob: ixt._curve.path, point: pt};
			}).flatten(ixts).value();

			offsets = _.pluck(ixts, 'offset');
			ixt_blobs = _.pluck(ixts, 'blob');

			paths = _.flatten([trace.id, scope.splitPathAtOffsets(trace, offsets)]);
			paths = _.map(paths, function(id){
				path = PaperUtil.queryID(id);
				var midpoint = path.getPointAt(path.length * 0.5);
				// var c = new paper.Path.Circle({
				// 	radius: 5, 
				// 	strokeColor: "green", 
				// 	strokeWidth: 1, 
				// 	position: midpoint.clone()
				// })
				// touches_a_blob = _.some(ixt_blobs, function(blob){ return blob.contains(midpoint); });
				in_a_blob = _.some(blobs, function(blob){ return blob.contains(midpoint); });
				if(in_a_blob) path.remove();
				else return path;
			});
			paths = _.compact(paths);
			// ADD BLOB CONNECTOR
			_.each(paths, function(path){
				var head = path.getPointAt(0);
				var tail = path.getPointAt(path.length);
				head_ixts = PaperUtil.getIntersections(new paper.Path.Circle({ position: head, radius: 2 }), blobs);
				tail_ixts = PaperUtil.getIntersections(new paper.Path.Circle({ position: tail, radius: 2 }), blobs);
				_.each(head_ixts, function(ixt){
					var blob = ixt._curve.path;
					path.insert(0, blob.bounds.center);
				});
				_.each(tail_ixts, function(ixt){
					var blob = ixt._curve.path;
					path.add(blob.bounds.center);
				});
			});
		});

		
		// STATS

		blobs = PaperUtil.query(paper.project, { prefix: blobs_p });
		traces = PaperUtil.query(paper.project, { prefix: traces_p });

		var after_b = blobs.length;
		var after_t = traces.length;
		console.log("\t", after_b, "(+" + (after_b - before_b) + ")", "BLOBS TO PROCESS");
		console.log("\t", after_t, "(+" + (after_t - before_t) + ")", "TRACES TO PROCESS");
		console.log("END BLOB_CONNECTION PROCESSING");
		var end = new Date().getTime();
		var time = end - start;
		console.log('%cBLOB_CONNECTION EXECUTION TIME: ' + time +  " ms", 'font-weight: bold; color: #111');
		console.log('----------------');
		
		
	},
	isValidSplitLocation: function(path, offset){
		return offset > EPSILON && path.length - offset > EPSILON;
	}, 
	splitPathAtOffsets: function(path, offsets){
		// console.log("Splitting", path.id, "@", offsets, path.length);
		var scope = this;
		offsets = _.sortBy(offsets);
		offsets = _.filter(offsets, function(e){
			return scope.isValidSplitLocation(path, e);
		});
		offsets = _.uniq(offsets);
		// console.log('Slicing', path.id, "@", offsets, path.length);

		var cut = 0;
		var oldPath = path;
		var created = [];

		_.each(offsets, function(offset){
			// console.log(offset, offset - cut);
			newPath = oldPath.split(offset - cut);
			newPath.name = oldPath.name;
			created.push(newPath.id);
			cut += (offset - cut);
			oldPath = newPath;
		});
		// console.log("Created:", created);
		return created;
	},
	getBlobFromNodes: function(nodes){
		var blobs = ["CGB", "CVB", "CNB", "CGT", "CVT", "CNT", "CNTB", "CVTB", "CGTB"];
		blobs = PaperUtil.query(paper.project, { prefix: blobs });

		return _.chain(nodes).map(function(node){
			return  _.filter(blobs, function(blob){
				return blob.contains(node.position);
			});
		}).flatten().compact().pluck("id").value();
	},
	getNodeFromBlobs: function(blobs){
		var nodes = PaperUtil.queryPrefix("NODE");
		return _.filter(nodes, function(node){
			return _.some(blobs, function(blob){ return blob.contains(node.position);})
		});
	},
	getSourceNode: function(){
		var batt_terminals = PaperUtil.queryPrefix("CVTB");
		var nodes = PaperUtil.queryPrefix("NODE");
		return this.getNodeFromBlobs(batt_terminals);
	},
	getSinkNode: function(){
		var batt_terminals = PaperUtil.queryPrefix("CGTB");
		var nodes = PaperUtil.queryPrefix("NODE");
		return this.getNodeFromBlobs(batt_terminals);
	},
	
	update: function(){
		paper.view.update();
		return this;
	}
}



