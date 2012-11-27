# This takes in the tab-delimited file and
# shoves it into the db

require 'sqlite3'
require 'time'

db = SQLite3::Database.new "data/cities2.db"
db.execute <<-SQL
  create table if not exists cities (
    name varchar(200),
    population bigint,
    timezone varchar(80)
  );
SQL

city_insert = db.prepare("insert into cities(name, population, timezone) values(?,?,?)")

cities = File.new("data/cities15000.txt", "r")
start_time = Time.now
while (city = cities.gets)
  split = city.split("\t")
  utf8_name = split[1]
  population = split[14]
  timezone = split[17]
  #db.execute("insert into cities(name, population, timezone) values(?,?,?)",utf8_name,population,timezone)
  city_insert.execute(utf8_name, population,timezone)
  puts "inserted #{split[0]}"
end
end_time = Time.now
puts "Took #{(end_time - start_time) * 1000}"
