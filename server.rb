require 'sinatra'
require 'sqlite3'
require 'time'
require 'tzinfo'
require 'uri' 
require "sinatra/json"

# Monkey patch for testing if a string is a numeric
# value.
class String
  def has_number?
    #Float(self) != nil rescue false
    /\d/.match(self) != nil
  end
end

cities = SQLite3::Database.new("data/cities.db")
search_statement = cities.prepare("select * from cities where name LIKE ? order by population desc")

# Host static directories
set :public_folder, File.dirname(__FILE__) + '/www'

# Simulate courtesy redirect
get '/' do
  redirect('/index.html')
end

get '/utc' do 
  now = Time.now().utc()
  json :utc_time => now.to_s
end

# Sample JSON response for ?q=New
# { results: [
#   { name: "New York City, offset: -5, inDst: false }
#   { name: "Newark", offset: -5, inDst: false }
# ]}
get '/search' do
  city = params[:q]
  unless city == nil
    city = URI.decode_www_form_component(city)
    wildcard_city = "#{city}%"
    city_results = []
    results = search_statement.execute(wildcard_city)
    results.each do |row|
      tz = TZInfo::Timezone.get(row[4])
      offset_in_minutes = tz.current_period.utc_offset
      in_dst = tz.current_period.dst?
      code = row[2].has_number? ? row[1] : "#{row[2]}, #{row[1]}"
      name = "#{row[0]}"
      c = { name: name, offset: offset_in_minutes, dstOffset: offset_in_minutes, inDst: in_dst, country: code }
      city_results.push c
    end
    json :results => city_results
  end
  json :error => "No 'q' query parameter for city search"
end
