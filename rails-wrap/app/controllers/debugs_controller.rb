class DebugsController < ApplicationController
  before_action :set_debug, only: [:show, :edit, :update, :destroy]

  # GET /debugs
  # GET /debugs.json
  def index
    @debugs = Debug.all
  end

  # GET /debugs/1
  # GET /debugs/1.json
  def show
  end

  # GET /debugs/new
  def new
    @debug = Debug.new
  end

  # GET /debugs/1/edit
  def edit
  end

  # POST /debugs
  # POST /debugs.json
  def create
    @debug = Debug.new(debug_params)

    respond_to do |format|
      if @debug.save
        format.html { redirect_to @debug, notice: 'Debug was successfully created.' }
        format.json { render :show, status: :created, location: @debug }
      else
        format.html { render :new }
        format.json { render json: @debug.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /debugs/1
  # PATCH/PUT /debugs/1.json
  def update
    respond_to do |format|
      if @debug.update(debug_params)
        format.html { redirect_to @debug, notice: 'Debug was successfully updated.' }
        format.json { render :show, status: :ok, location: @debug }
      else
        format.html { render :edit }
        format.json { render json: @debug.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /debugs/1
  # DELETE /debugs/1.json
  def destroy
    @debug.destroy
    respond_to do |format|
      format.html { redirect_to debugs_url, notice: 'Debug was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_debug
      @debug = Debug.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def debug_params
      params.require(:debug).permit(:name, :steps)
    end
end
