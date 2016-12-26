class DigitalModel < ActiveRecord::Base
	mount_uploader :thumbnail, PictureUploader
	mount_uploader :bump_map, PictureUploader
	
	belongs_to :design

	validates :name, :bump_map, :base_height, :displacement, :height, :width, :thumbnail, :presence => true
	validates :name, :uniqueness => true 
end
