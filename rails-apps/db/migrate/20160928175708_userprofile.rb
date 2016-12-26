class Userprofile < ActiveRecord::Migration
  def change
  	add_column :users, :image, :string
  	add_column :users, :description, :text
  	add_column :users, :location, :string
  	add_column :users, :role, :string
  	add_column :users, :license, :string
  	add_column :users, :twitter_handle, :string
  	add_column :users, :website, :string
  	add_column :users, :default_license, :string
  end
end
