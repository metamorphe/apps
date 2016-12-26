class DigitalModelsController < ApplicationController
  before_action :set_digital_model, only: [:show, :edit, :update, :destroy]

  respond_to :html

  def index
    @digital_models = DigitalModel.all
    respond_with(@digital_models)
  end

  def show
    respond_with(@digital_model)
  end

  def new
    @digital_model = DigitalModel.new
    respond_with(@digital_model)
  end

  def edit
  end

  def create
    @digital_model = DigitalModel.new(digital_model_params)
    @digital_model.save
    respond_with(@digital_model)
  end

  def update
    @digital_model.update(digital_model_params)
    respond_with(@digital_model)
  end

  def destroy
    @digital_model.destroy
    respond_with(@digital_model)
  end

  private
    def set_digital_model
      @digital_model = DigitalModel.find(params[:id])
    end

    def digital_model_params
      params.require(:digital_model).permit(:design_id, :name, :base_height, :displacement, :height, :width, :depth, :thumbnail, :bump_map)
    end
end
