class CreateMembers < ActiveRecord::Migration
  def change
    create_table :members do |t|
      t.string :name
      t.string :image
      t.string :role
      t.string :location
      t.string :twitter_handle
      t.string :website
      t.string :default_license
      t.text :description

      t.timestamps
    end
  end
end
