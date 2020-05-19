CREATE TABLE IF NOT EXISTS stg_jnl (
    cmdr TEXT,
    jnltime REAL,
    event TEXT,
    jsondata TEXT);

CREATE TABLE IF NOT EXISTS stg_loadout (
    cmdr TEXT,
    ship_id INTEGER,
    jnltime REAL, 
    jsondata TEXT,
    coriolis TEXT,
    CONSTRAINT ldout_pk PRIMARY KEY (cmdr, ship_id)
    );

CREATE TABLE IF NOT EXISTS stg_st_ships (
    cmdr TEXT,
    jnltime REAL, 
    jsondata TEXT,
    CONSTRAINT ldout_pk PRIMARY KEY (cmdr));

CREATE TABLE IF NOT EXISTS stg_st_mods (
    cmdr TEXT,
    jnltime REAL, 
    jsondata TEXT,
    CONSTRAINT ldout_pk PRIMARY KEY (cmdr));

create view IF NOT EXISTS v_loadout as
select jnl.cmdr,
       jnl.ship_id,
       json_extract(jnl.jsondata,'$.Ship') as shiptype,
       json_extract(jnl.jsondata,'$.ShipName') as shipname,
       date(jnl.jnltime) || ' ' || time(jnl.jnltime) as jnltime, 
       round(julianday('now') - jnl.jnltime) as days_old,
       jnl.jsondata,
       jnl.coriolis 
  from stg_loadout jnl
 order by jnl.cmdr, jnl.ship_id;

