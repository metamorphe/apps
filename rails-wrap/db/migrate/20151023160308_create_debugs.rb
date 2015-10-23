class CreateDebugs < ActiveRecord::Migration
  def change
    create_table :debugs do |t|
      t.string :name
      t.text :steps

      t.timestamps
    end
  end
end
