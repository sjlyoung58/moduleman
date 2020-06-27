echo off
echo Analysing journals...
node --experimental-modules --no-warnings ./src/journalscan.mjs
echo ....done
echo finished processing journals
node --experimental-modules --no-warnings ./src/createAssets.mjs
echo finished creating output

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

DAYS=${2:-10} 
echo extracting $DAYS days of csv conflicts data to ./public/extracts/conflicts.csv
./resources/sqlite3 ./db/journal.sqlite3 <<EOF
.headers on
.mode csv
.output ./public/extracts/conflicts.csv
select * from v_conflicts where days_old <= $DAYS;
.quit
EOF
echo `<./public/extracts/conflicts.csv wc -l` lines of data extracted
