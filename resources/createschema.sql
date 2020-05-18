CREATE TABLE IF NOT EXISTS stg_jnl (
    cmdr TEXT,
    jnltime REAL,
    event TEXT,
    jsondata TEXT);

CREATE TABLE IF NOT EXISTS stg_loadout (
    cmdr TEXT,
    jnltime REAL, 
    ship_id INTEGER,
    jsondata TEXT);

CREATE TABLE IF NOT EXISTS stg_st_ships (
    cmdr TEXT,
    jnltime REAL, 
    jsondata TEXT);

CREATE TABLE IF NOT EXISTS stg_st_mods (
    cmdr TEXT,
    jnltime REAL, 
    jsondata TEXT);

create view IF NOT EXISTS v_loadout as
with latest as (
select cmdr,ship_id, max(jnltime) as jnltime
  FROM stg_loadout sl 
 group by cmdr, ship_id
)
select jnl.cmdr,
       date(jnl.jnltime) || ' ' || time(jnl.jnltime) as jnltime, 
       jnl.ship_id,
       jnl.jsondata 
  from latest lat 
  inner join stg_loadout jnl on jnl.cmdr = lat.cmdr and jnl.ship_id = lat.ship_id and jnl.jnltime = lat.jnltime
 order by jnl.cmdr, jnl.ship_id;
