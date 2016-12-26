class CreateDigitalModels < ActiveRecord::Migration
  def change
    create_table :digital_models do |t|
      t.integer :design_id
      t.string :name
      t.float :base_height
      t.float :displacement
      t.float :height
      t.float :width
      t.float :depth
      t.string :thumbnail
      t.string :bump_map

      t.timestamps
    end
  end
end
