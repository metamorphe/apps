class AppsController < ApplicationController
  def tactile_generator
  	@digital_model = DigitalModel.find(params[:id])
  	# render :json => @digital_model
  	render :layout => "full_screen"
  end
  def light_as_material
  end
  
end
