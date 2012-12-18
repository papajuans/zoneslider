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

# Calculate the offset of a timezone during daylight savings
def calculate_dst_offset(some_tz)
  unless some_tz.current_period.dst?

    # local_end will be unbounded if they don't follow DST
    if some_tz.current_period.local_end.nil?
      return some_tz.current_period.utc_total_offset
    end

    # Roll to the next period so that it is DST
    dst_time = some_tz.current_period.local_end + 1
    dst_period = some_tz.period_for_local(dst_time)
    return dst_period.utc_total_offset
  end

  return some_tz.current_period.utc_total_offset
end

cities = SQLite3::Database.new("data/cities.db")
search_statement = cities.prepare("select * from cities where name LIKE ? order by population desc")

before do
  logger.info request.path_info
  logger.info request.fullpath
  logger.info request.url
end

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
      current_tz_period = tz.current_period

      # This is the normal offset when NOT in daylight savings mode
      utc_offset = current_tz_period.utc_offset

      # The date in which a new offset should be calculated (either
      # entering or exiting daylight savings time
      next_transition = current_tz_period.local_end.to_s

      # This is the offset to use when in daylight savings mode
      dst_offset = calculate_dst_offset tz

      in_dst = current_tz_period.dst?

      country = TZInfo::Country.get(row[1])
      full_country_name = row[2].has_number? ? country.name : "#{row[2]}, #{country.name}"
      city_name = "#{row[0]}"
      next_transition = tz.current_period.local_end.to_s
      c = { city: city_name, offset: utc_offset, dstOffset: dst_offset, 
            inDst: in_dst, country: full_country_name, nextTimeChange: next_transition }
      city_results.push c
    end
    return json :results => city_results
  end
  json :error => "No 'q' query parameter for city search"
end
