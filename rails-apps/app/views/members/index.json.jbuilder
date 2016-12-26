json.array!(@members) do |member|
  json.extract! member, :id, :name, :image, :role, :location, :twitter_handle, :website, :default_license, :description
  json.url member_url(member, format: :json)
end
