echo
echo Running diagnostic SQL scripts
echo Internal ship names containing _ character
sqlite3 ./db/journal.sqlite3 < ./resources/diag.sql
echo
