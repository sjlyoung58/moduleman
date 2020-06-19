DAYS=${1:-5} 
echo extracting $DAYS days of csv FSDJump data to ./public/extracts/fsdjump.csv
./resources/sqlite3 ./db/journal.sqlite3 <<EOF
.headers on
.mode csv
.output ./public/extracts/fsdjump.csv
select * from v_fsdjump where days_old <= $DAYS;
.quit
EOF
echo `<./public/extracts/fsdjump.csv wc -l` lines of data extracted
