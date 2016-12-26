class Member < ActiveRecord::Base
	mount_uploader :image, PictureUploader
	belongs_to :user
	has_many :designs, foreign_key: "author_id"
	# def projects 
	# 	self.teams.collect{|t| t.project}.flatten
	# end
	def to_param
		"#{id}-#{slug}"
	end
	def slug
		name.downcase.gsub(" ", "-").gsub("'","").gsub(".", "")
	end
end
