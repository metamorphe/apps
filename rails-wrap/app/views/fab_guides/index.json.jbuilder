json.array!(@fab_guides) do |fab_guide|
  json.extract! fab_guide, :id, :design_id, :instruction_order, :main_message, :guide_type, :highlight_elements, :tips, :debug_id
  json.url fab_guide_url(fab_guide, format: :json)
end
