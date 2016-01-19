// In circuit designer, var sr_model;

$(function(){
  $('#sheet-resistance').submit(function(){
    val = $(this).children('input').val().trim();
    if(val == "" || val < 0){
      sys.alert("You need to provide a valid sheet resistance value.");
    } else{
      sr_model.update(val);
      sys.show("Sheet resistance set to " + val + " Ω");
      $('#calibrate').click();
    }
    return false;
  });
});

function SheetResistanceModel(sr){
	this.sr = 0.5;
}

SheetResistanceModel.prototype = {
	/* Returns the resistance of a uniform path */
	apply: function(path){
		var W = Ruler.pts2mm(path.style.strokeWidth); // width of stroke in mm
		var L = Ruler.pts2mm(path.length);
		return this.sr * L / W; 
	}, 
	update: function(sr){
		this.sr = sr;
	}
}