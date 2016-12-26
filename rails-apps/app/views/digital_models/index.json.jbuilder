json.array!(@digital_models) do |digital_model|
  json.extract! digital_model, :id, :design_id, :name, :base_height, :displacement, :height, :width, :depth, :thumbnail, :bump_map
  json.url digital_model_url(digital_model, format: :json)
end
