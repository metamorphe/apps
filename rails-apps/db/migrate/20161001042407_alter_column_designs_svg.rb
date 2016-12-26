class AlterColumnDesignsSvg < ActiveRecord::Migration

  def self.up
    change_table :designs do |t|
      t.change :svg, :text, :default => ""
    end
  end
  def self.down
    change_table :products do |t|
      t.change :svg, :string
    end
  end
end