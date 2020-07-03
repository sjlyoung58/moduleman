./resources/sqlite3 ./db/journal.sqlite3 <<EOF
.headers off
select replace(cmdr,' ','-') as cmdr
  from stg_fsdjump
 where cmdr <> 'none'
group by cmdr order by count(*) desc limit 1;
.quit
EOF