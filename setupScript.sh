cd "$(dirname "$0")"

# Dropping the whole database (if it exists)
dropdb --if-exists localdb

# Creating the database
createdb localdb

# Running migration and seeding the data
knex migrate:latest
knex seed:run
