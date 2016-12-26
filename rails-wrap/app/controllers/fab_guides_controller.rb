class FabGuidesController < ApplicationController
  before_action :set_fab_guide, only: [:show, :edit, :update, :destroy]

  # GET /fab_guides
  # GET /fab_guides.json
  def index
    @fab_guides = FabGuide.all
  end

  # GET /fab_guides/1
  # GET /fab_guides/1.json
  def show
  end

  # GET /fab_guides/new
  def new
    @fab_guide = FabGuide.new
  end

  # GET /fab_guides/1/edit
  def edit
  end

  # POST /fab_guides
  # POST /fab_guides.json
  def create
    @fab_guide = FabGuide.new(fab_guide_params)

    respond_to do |format|
      if @fab_guide.save
        format.html { redirect_to @fab_guide, notice: 'Fab guide was successfully created.' }
        format.json { render :show, status: :created, location: @fab_guide }
      else
        format.html { render :new }
        format.json { render json: @fab_guide.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /fab_guides/1
  # PATCH/PUT /fab_guides/1.json
  def update
    respond_to do |format|
      if @fab_guide.update(fab_guide_params)
        format.html { redirect_to @fab_guide, notice: 'Fab guide was successfully updated.' }
        format.json { render :show, status: :ok, location: @fab_guide }
      else
        format.html { render :edit }
        format.json { render json: @fab_guide.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /fab_guides/1
  # DELETE /fab_guides/1.json
  def destroy
    @fab_guide.destroy
    respond_to do |format|
      format.html { redirect_to fab_guides_url, notice: 'Fab guide was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_fab_guide
      @fab_guide = FabGuide.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def fab_guide_params
      params.require(:fab_guide).permit(:design_id, :instruction_order, :main_message, :guide_type, :highlight_elements, :tips, :debug_id)
    end
end
