SELECT cmdr, 
       jnltime, 
       date(jnltime), time(jnltime),
       ship_id, 
       jsondata
  FROM stg_loadout
 order by jnltime desc;

drop view v_loadout;

create view IF NOT EXISTS v_loadout as
with latest as (
select cmdr,ship_id, max(jnltime) as jnltime
  FROM stg_loadout sl 
 group by cmdr, ship_id
)
select jnl.cmdr,
       date(jnl.jnltime) || ' ' || time(jnl.jnltime) as jnltime, 
       jnl.ship_id,
       jnl.jsondata,
       jnl.coriolis 
  from latest lat 
  inner join stg_loadout jnl on jnl.cmdr = lat.cmdr and jnl.ship_id = lat.ship_id and jnl.jnltime = lat.jnltime
 order by jnl.cmdr, jnl.ship_id;

select * from v_loadout;

SELECT 'jnl' as tab, count(*) FROM stg_jnl union
SELECT 'loadout' as tab, count(*) FROM stg_loadout union
SELECT 'mods' as tab, count(*) FROM stg_st_mods union 
SELECT 'ships' as tab, count(*) FROM stg_st_ships;

delete from stg_jnl;

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

SELECT julianday('now');

drop view v_stored_ships;

create view v_stored_ships as
SELECT shp.cmdr, json_extract(jsondata,'$.StarSystem') || '/' || json_extract(jsondata,'$.StationName') as current,
       json_extract(value,'$.ShipID') as ship_id,
       json_extract(value,'$.ShipType') as shiptype, 
       json_extract(value,'$.ShipType_Localised') as shiptypel, 
       json_extract(value,'$.Name') as shipname,
       json_extract(value,'$.StarSystem') as star,
       json_extract(value,'$.Value') as value,
       json_extract(value,'$.Hot') as Hot,
       json_extract(value,'$.TransferPrice') as xfer_cost,       
       json_extract(value,'$.TransferTime')/60 as xfer_time      
  FROM stg_st_ships shp, json_each(shp.jsondata,'$.ShipsRemote')
union 
SELECT shp.cmdr, json_extract(jsondata,'$.StarSystem') || '/' || json_extract(jsondata,'$.StationName') as current,
       json_extract(value,'$.ShipID') as ship_id,
       json_extract(value,'$.ShipType') as shiptype,
       json_extract(value,'$.ShipType_Localised') as shiptypel, 
       json_extract(value,'$.Name') as shipname,
       json_extract(jsondata,'$.StarSystem') as star,
       json_extract(value,'$.Value') as value,
       json_extract(value,'$.Hot') as Hot,
       0 as xfer_cost,       
       0 as xfer_time      
  FROM stg_st_ships shp, json_each(shp.jsondata,'$.ShipsHere');
 
SELECT cmdr, jsondata FROM stg_st_ships;

select *, value FROM stg_st_ships shp, json_each(shp.jsondata,'$.ShipsRemote')

SELECT count(*) FROM v_stored_ships;

select count(*) from v_loadout;

SELECT * FROM v_stored_ships;

select * from v_loadout;

with ships as (
SELECT --st.cmdr, st.shipname, 
       coalesce(ld.cmdr, st.cmdr) as cmdr, 
       coalesce(ld.ship_id, st.ship_id) as ship_id, 
       coalesce(st.shiptypel, 
                (UPPER(SUBSTR(ld.shiptype, 1, 1)) || SUBSTR(ld.shiptype, 2)), 
                st.shiptype) as shiptype,
       coalesce(ld.shipname, st.shipname) as shipname,
       coalesce(st.star,'<current ship>') as star,
       st.value, st.xfer_cost, st.xfer_time,
       coalesce(ld.jnltime,'<no recent data>') as jnltime,
       coalesce(ld.days_old,'<no recent data>') as days_old,
       coalesce(ld.jsondata,'<no recent data>') as jsondata,  
       coalesce(ld.coriolis,'./links.html') as coriolis
       --ld.*
  FROM v_stored_ships st
  left outer join v_loadout ld 
    on st.cmdr = ld.cmdr and st.ship_id = ld.ship_id
)
select *
  from ships
 order by cmdr, ship_id;

SELECT ld.*
  FROM v_loadout ld
  left outer join v_stored_ships st
    on st.cmdr = ld.cmdr and st.ship_id = ld.ship_id ;

SELECT st.cmdr, ld.* 
  FROM v_loadout ld
  left outer join v_stored_ships st
    on st.cmdr = ld.cmdr and st.ship_id = ld.ship_id ;
   
   
--======================--
-- expanding modules to rows
select tr.*, ld.* 
  FROM stg_loadout ld, json_tree(ld.jsondata,'$.Modules') tr

select *
  from stg_st_mods md, json_tree(md.jsondata,'$.Items') tr 
