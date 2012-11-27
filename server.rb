require 'sinatra'
require 'sqlite3'
require 'time'
require 'tzinfo'
require 'uri' 

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

# We always return JSON
after do
  headers({'content-type'=> 'application/json'});
end

get '/utc' do 
  now = Time.now().utc()
  "{\"utc_time\": \"#{now}\"}"
end

# Sample JSON response for ?q=New
# { results: [
#   { name: "New York City, offset: -5, inDst: false }
#   { name: "Newark", offset: -5, inDst: false }
# ]}
get '/search' do
  city = request.query_string.split("&")[0].split("=")[1]
  city = URI.decode_www_form_component(city)
  wildcard_city = "#{city}%"
  city_results = []
  results = search_statement.execute(wildcard_city)
  results.each do |row|
    tz = TZInfo::Timezone.get(row[4])
    offset_in_minutes = tz.current_period.utc_offset
    in_dst = tz.current_period.dst?
    code = row[2].has_number? ? row[1] : "#{row[2]}, #{row[1]}"
    name = "#{row[0]}, #{code}" 
    city_results.push "{\"name\": \"#{name}\", \"offset\": \"#{offset_in_minutes}\", \"inDst\": \"#{in_dst}\"}"
  end
  "{ \"results\": [" + city_results.join(',') + "]}"
end
