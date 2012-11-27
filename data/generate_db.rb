# This takes in the tab-delimited file and
# shoves it into the db
require 'time'
require 'sqlite3'

db_filepath = "cities.db"
db = SQLite3::Database.new db_filepath
db.execute <<-SQL
  create table if not exists cities (
    name varchar(200),
    population bigint,
    timezone varchar(80)
 );
SQL

db.execute "delete from cities"
city_insert = db.prepare("insert into cities(name, population, timezone) values(?,?,?)")
cities = File.new "cities15000.txt"
num_rows_inserted = 0
db.transaction
start_time = Time.now
while (city = cities.gets)
  split = city.split("\t")
  utf8_name = split[1]
  population = split[14]
  timezone = split[17]
  city_insert.execute(utf8_name, population,timezone)
  num_rows_inserted += 1
end
db.commit
end_time = Time.now
puts "Took #{(end_time - start_time) * 1000} seconds to insert #{num_rows_inserted} records."
