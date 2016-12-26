class AddPublishColumnToDesigns < ActiveRecord::Migration
  def change
  	add_column :designs, :publish, :string, :default => "Public"
  end
end
