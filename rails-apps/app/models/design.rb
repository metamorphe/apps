# add_column :designs, :image, :string
# add_column :designs, :description, :text
# add_column :designs, :author_id, :text
# add_column :designs, :svg, :string
# add_column :designs, :license, :string
# add_column :designs, :views, :integer
# add_column :designs, :downloads, :integer
# add_column :designs, :makes, :integer
# add_column :designs, :publish, :string, :default => "Public"

class Design < ActiveRecord::Base
  mount_uploader :json, JsonUploader
	mount_uploader :svg, JsonUploader
	mount_uploader :image, PictureUploader
  # belongs_to :user, foreign_key: "author_id"
  validates :name, :license, :publish, :presence => true
  has_many :digital_models
  
  def self.autocomplete
    Design.pluck(:name).uniq.to_json.html_safe
  end
  def self.published
    Design.where("published = ?", "Public")
  end
  def next
    Design.where("id > ?", self[:id]).order("id ASC").first
  end

  def self.search(query, phyla, count)
    designs = self.query(query)
  end

  def self.query(query)
    Stl.where("lower(name) LIKE ?", query.downcase)
  end

  def prev
    Design.where("id < ?", self[:id]).order("id DESC").first
  end

  def author
    print "HELLO"
    print self[:author_id]
    Member.find(self["author_id"])
  end
  def to_param
    "#{id}-#{slug}"
  end
  def slug
    name.downcase.gsub(" ", "-").gsub("'","").gsub(".", "")
  end
  
end






