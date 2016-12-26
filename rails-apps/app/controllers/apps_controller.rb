class AppsController < ApplicationController
  def tactile_generator
  	@digital_model = DigitalModel.find(params[:id])
  	render :layout => "full_screen"
  end
  def light_as_material
  end
  
end
