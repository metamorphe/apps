json.array!(@debugs) do |debug|
  json.extract! debug, :id, :name, :steps
  json.url debug_url(debug, format: :json)
end
