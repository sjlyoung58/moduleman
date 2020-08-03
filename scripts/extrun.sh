echo off
echo Analysing journals...
node --experimental-modules --no-warnings ./src/journalscan.mjs
echo ....done
echo finished processing journals
node --experimental-modules --no-warnings ./src/createAssets.mjs
echo finished creating output

DAYS1=${1:-0} 
echo extracting $DAYS1 days of csv FSDJump data to ./public/extracts/fsdjump.csv
./resources/sqlite3 ./db/journal.sqlite3 <<EOF
.headers on
.mode csv
.output ./public/extracts/fsdjump.csv
select * from v_fsdjump where days_old <= $DAYS1;
.quit
EOF
echo `<./public/extracts/fsdjump.csv wc -l` lines of data extracted

DAYS2=${2:-9} 
echo extracting $DAYS2 days of csv conflicts data to ./public/extracts/conflicts.csv
./resources/sqlite3 ./db/journal.sqlite3 <<EOF
.headers on
.mode csv
.output ./public/extracts/conflicts.csv
select * from v_conflicts where days_old <= $DAYS2;
.quit
EOF
echo `<./public/extracts/conflicts.csv wc -l` lines of data extracted

CMDR=`./scripts/getMainCmdr.sh`_`date +%a`
EXJNL=./public/extracts/TourData.991231999999.$CMDR.log

echo extracting 60 days of Tour Data to $EXJNL
./resources/sqlite3 ./db/journal.sqlite3 <<EOF
.headers off
.output $EXJNL
select jsondata 
  from stg_fsdjump
 where round(julianday('now') - jnltime) <= 60
UNION 
select jsondata 
  from stg_fsssignal sf 
 where round(julianday('now') - jnltime) <= 60;
.quit
EOF
echo `<$EXJNL wc -l` lines of data extracted

echo extracting current conflict summary csv to ./public/extracts/conf_summ.csv
./resources/sqlite3 ./db/journal.sqlite3 <<EOF
.headers on
.mode csv
.output ./public/extracts/conf_summ.csv
select * from v_conflict_summary;
.quit
EOF
echo `<./public/extracts/conf_summ.csv wc -l` lines of data extracted

echo extracting formatted conflict summary to ./public/extracts/conf_summ.txt
./resources/sqlite3 ./db/journal.sqlite3 <<EOF
.headers off
.output ./public/extracts/conf_summ.txt
select * from v_conflict_pretty;
.quit
EOF
echo `<./public/extracts/conf_summ.txt wc -l` lines of data extracted
