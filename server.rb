require 'sinatra'
require 'time'

get '/utc' do 
  now = Time.now().utc()
  headers({'content-type'=> 'application/json'});
  return "{utc_time: #{now}}"
end

