database="db/journal.sqlite3"
rm -f "$database"

sqlite3 ./db/journal.sqlite3 < ./schema/createtables.sql
sqlite3 ./db/journal.sqlite3 < ./schema/createviews.sql
