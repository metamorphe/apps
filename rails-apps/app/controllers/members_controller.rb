class MembersController < ApplicationController
  before_action :set_member, only: [:show, :edit, :update, :destroy]

  respond_to :html

  def index
    @members = Member.all
    respond_with(@members)
  end

  def show
    user = User.find(params[:id])
    @email = user.email
    @member = user.member
  end

  def new
    @member = Member.new
    respond_with(@member)
  end

  def edit
  end

  def create
    @member = Member.new(member_params)
    @member.role = "Member"
    @member.save
    if @member.image.nil?
      @member.image.store!(File.open("#{Rails.root}/public/user.png"))
    end
    respond_with(@member)
  end

  def update
    print "UPDATING!!!!!!!!!"
    print @member.image.present?
    @member.update(member_params)
    if not @member.image.present?
      @member.image.store!(File.open("#{Rails.root}/public/user.png"))
    end
    respond_with(@member)
  end

  def destroy
    @member.destroy
    respond_with(@member)
  end

  private
    def set_member
      @member = Member.find(params[:id])
    end

    def member_params
      params.require(:member).permit(:name, :image, :role, :location, :twitter_handle, :website, :default_license, :description)
    end
end
