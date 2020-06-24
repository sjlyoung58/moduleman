DAYS=${1:-10} 
echo extracting $DAYS days of csv conflicts data to ./public/extracts/conflicts.csv
./resources/sqlite3 ./db/journal.sqlite3 <<EOF
.headers on
.mode csv
.output ./public/extracts/conflicts.csv
select * from v_conflicts where days_old <= $DAYS;
.quit
EOF
echo `<./public/extracts/conflicts.csv wc -l` lines of data extracted
