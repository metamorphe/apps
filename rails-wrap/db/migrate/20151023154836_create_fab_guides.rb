class CreateFabGuides < ActiveRecord::Migration
  def change
    create_table :fab_guides do |t|
      t.integer :design_id
      t.integer :instruction_order
      t.string :main_message
      t.integer :guide_type
      t.string :highlight_elements
      t.string :tips
      t.integer :debug_id

      t.timestamps
    end
  end
end
