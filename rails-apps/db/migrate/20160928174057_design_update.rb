class DesignUpdate < ActiveRecord::Migration
  def change
  	add_column :designs, :image, :string
  	add_column :designs, :description, :text
  	add_column :designs, :author_id, :text
  	add_column :designs, :svg, :string
  	add_column :designs, :license, :string
  	add_column :designs, :views, :integer
  	add_column :designs, :downloads, :integer
  	add_column :designs, :makes, :integer
  end
end
