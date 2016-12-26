class DesignsController < ApplicationController
  before_action :set_design, only: [:download_count, :interface, :show, :edit, :update, :destroy, :design_update]


  def download_count
    @design.downloads =  @design.downloads + 1;
    @design.save!
  end
  # GET /designs
  # GET /designs.json
  def index
    @designs = Design.all
  end

  # GET /designs/1
  # GET /designs/1.json
  def show
    @design[:views] ||= 0;
    @design[:views] = @design[:views] + 1;
    @design.save!
  end

  # GET /designs/new
  def new
    @design = Design.new
    if user_signed_in? 
      @design.name = "#{current_user.member.name}'s Circuit Sketch"
      @design.author_id = current_user.id
      @design.license = @design.author.default_license
    else
      @design.name = "#{Member.find(3).name}'s Circuit Sketch"
      @design.author_id = Member.find(3).id
      @design.license = @design.author.default_license
    end
    @design.views = 1
    @design.downloads = 0
    @design.makes = 0
  end

  # GET /designs/1/edit
  def edit
  end

  def design_update
    directory = "public/uploads/tmp"
    
    if params[:json] then
      path = File.join(directory, params[:name] + ".json")
      File.open(path, "wb") { |f| f.write(params[:json]) }
      @design.json = File.open(path)
      @design.save!
    end

    if params[:svg] then
      path = File.join(directory, params[:name] + ".svg")
      File.open(path, "wb") { |f| f.write(params[:svg]) }
      @design.svg = File.open(path)
      @design.save!
    end

    if params[:image] then
      path = File.join(directory, params[:name] + ".png")
      image_data = Base64.decode64(params[:image]['data:image/png;base64,'.length .. -1])
      File.open(path, "wb") { |f| f.write(image_data) }
      @design.image.store!( File.open(path))
    end
    render :json => params
  end

  # POST /designs
  # POST /designs.json
  def create
    @design = Design.new(design_params)
    if user_signed_in? 
      @design.author_id = current_user.id
    else
      @design.author_id = 3
    end
    @design.views = 1
    @design.downloads = 0
    @design.makes = 0

    respond_to do |format|
      if @design.save
        format.html { redirect_to @design, notice: 'Design was successfully created.' }
        format.json { render :show, status: :created, location: @design }
      else
        format.html { render :new }
        format.json { render json: @design.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /designs/1
  # PATCH/PUT /designs/1.json
  def update
    respond_to do |format|
      if @design.update(design_params)
        format.html { redirect_to @design, notice: 'Design was successfully updated.' }
        format.json { render :show, status: :ok, location: @design }
      else
        format.html { render :edit }
        format.json { render json: @design.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /designs/1
  # DELETE /designs/1.json
  def destroy
    @design.destroy
    respond_to do |format|
      format.html { redirect_to designs_url, notice: 'Design was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_design
      @design = Design.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def design_params
      params.require(:design).permit(:name, :bom, :json, :image, :description, :author_id, :svg, :license, :publish)

    end
end
