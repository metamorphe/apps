class FabGuide < ActiveRecord::Base
	belongs_to :design
	has_one :debug
	
	def self.guide_key
		return ["Confirmation", 0 ], ["Checkpoint", 1]
	end
	def guide_type
		if self[:guide_type].nil? 
			return ""
		end
		key = FabGuide.guide_key()
		return key[self[:guide_type]][0]
	end

end
