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

drop view v_ship_list;

create view v_ship_list as
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

SELECT * FROM v_ship_list;


SELECT ld.*
  FROM v_loadout ld
  left outer join v_stored_ships st
    on st.cmdr = ld.cmdr and st.ship_id = ld.ship_id ;

SELECT st.cmdr, ld.* 
  FROM v_loadout ld
  left outer join v_stored_ships st
    on st.cmdr = ld.cmdr and st.ship_id = ld.ship_id ;

 --=== last shipyard visited ===--
 
SELECT cmdr,
       json_extract(jsondata,'$.StarSystem') as star,
       json_extract(jsondata,'$.StationName') as station,
       date(jnltime) || ' ' || time(jnltime) as jnltime,
              round(julianday('now') - jnltime) as days_old
       ,jsondata FROM stg_st_ships;

   
--======================--
drop table engineer;
      
CREATE TABLE engineer (
	engineer TEXT,
	base TEXT,
	system_id INTEGER,
	"system" TEXT,
	needs_permit TEXT,
	distance_to_star INTEGER,
	has_market TEXT
);

delete from engineer;

INSERT INTO engineer (engineer,base,system_id,"system",needs_permit,distance_to_star,has_market) VALUES
       ('Liz Ryder','Demolition Unlimited',4698,'Eurybia','0',318,'1'),
       ('Didi Vatermann','Vatermann LLC',11630,'Leesti','0',17,'1'),
       ('Selene Jean','Prospector''s Rest',11143,'Kuk','0',12418,'1'),
       ('Juri Ishmaak','Pater''s Memorial',5229,'Giryak','0',444,'0'),
       ('Tod ''The Blaster'' McQuinn','Trophy Camp',19159,'Wolf 397','0',135,'0'),
       ('Bill Turner','Turner Metallics Inc',718,'Alioth','1',2359,'1'),
       ('Elvira Martuuk','Long Sight Base',10777,'Khun','0',61,'0'),
       ('Hera Tani','The Jet''s Hole',11308,'Kuwemaki','0',44,'1'),
       ('Marco Qwent','Qwent Research Base',16977,'Sirius','1',7918,'1'),
       ('Ram Tah','Phoenix Base',13536,'Meene','0',2198,'0'),
       ('Professor Palin','Palin Research Centre',21114,'Maia','0',1143,'0'),
       ('Etienne Dorn','Kraken''s Retreat',10918139,'Los','0',1217,'0'),
       ('Petra Olmanova','Sanctuary',10918515,'Asura','0',3153,'0'),
       ('Zacariah Nemo','Nemo Cyber Party Base',19602,'Yoru','0',89,'1'),
       ('Felicity Farseer','Farseer Inc',4079,'Deciat','0',2041,'0'),
       ('Tiana Fortune','Fortune''s Loss',432,'Achenar','1',5834,'1'),
       ('Broo Tarquin','Broo''s Legacy',13907,'Muang','0',177,'0'),
       ('The Dweller','Black Hide',19341,'Wyrd','0',9,'1'),
       ('Lori Jameson','Jameson Base',16827,'Shinrarta Dezhra','1',41,'0'),
       ('Mel Brandon','The Brig',10922743,'Luchtaine','0',1482,'0'),
       ('Marsha Hicks','The Watchtower',10930894,'Tir','0',109,'0'),
       ('Chloe Sedesi','Cinder Dock',116417,'Shenve','0',172,'0'),
       ('Lei Cheung','Trader''s Rest',11445,'Laksak','0',199,'1'),
       ('The Sarge','The Beach',2240,'Beta-3 Tucani','0',3353,'0'),
       ('Colonel Bris Dekker','Dekker''s Yard',17072,'Sol','1',5009,'0');


select * from engineer;
--======================--

-- expanding modules to rows
select *
  from stg_st_mods md, json_tree(md.jsondata,'$.Items') tr 
 where parent = 253;

select md.cmdr, 
--       md.jnltime,
       tr.value,
       json_extract(tr.value,'$.Name_Localised') as Name_Localised,
       json_extract(tr.value,'$.Name') as Name,
       json_extract(tr.value,'$.EngineerModifications') as EngineerModifications,
       json_extract(tr.value,'$.Level') as Level,
       json_extract(tr.value,'$.Quality') as Quality,
       json_extract(tr.value,'$.StorageSlot') as StorageSlot,
       json_extract(tr.value,'$.StarSystem') as StarSystem,
       json_extract(tr.value,'$.MarketID') as MarketID,
       json_extract(tr.value,'$.TransferCost') as TransferCost,
       json_extract(tr.value,'$.TransferTime') as TransferTime,
       json_extract(tr.value,'$.BuyPrice') as BuyPrice,
       json_extract(tr.value,'$.Hot') as Hot
  from stg_st_mods md, json_each(md.jsondata,'$.Items') tr 
 where json_extract(tr.value,'$.EngineerModifications') is not null
 order by json_extract(tr.value,'$.Name_Localised'), json_extract(tr.value,'$.BuyPrice') desc
;

drop view v_stored_modules;

create view v_stored_modules as 
with raw as (
select md.cmdr, 
--       md.jnltime,
       json_extract(tr.value,'$.Name_Localised') as Name_Localised,
       json_extract(tr.value,'$.Name') as Name,
       json_extract(tr.value,'$.EngineerModifications') as EngineerModifications,
       json_extract(tr.value,'$.Level') as Level,
       json_extract(tr.value,'$.Quality') as Quality,
       json_extract(tr.value,'$.StorageSlot') as StorageSlot,
       json_extract(tr.value,'$.StarSystem') as StarSystem,
       json_extract(tr.value,'$.MarketID') as MarketID,
       json_extract(tr.value,'$.TransferCost') as TransferCost,
       json_extract(tr.value,'$.TransferTime') as TransferTime,
       json_extract(tr.value,'$.BuyPrice') as BuyPrice,
       json_extract(tr.value,'$.Hot') as Hot
  from stg_st_mods md, json_each(md.jsondata,'$.Items') tr 
),
csv as (
select cmdr,
       Name_Localised,
       '{"nameParts":["' || replace(replace(replace(Name,'_','","'),',"name;',''),'$','') || ']}' as name_jsa,
       EngineerModifications,
       "Level",Quality,StorageSlot,StarSystem,MarketID,TransferCost,TransferTime,BuyPrice,Hot
 from raw
),
split as (
select cmdr,
       Name_Localised,
       case json_extract(name_jsa,'$.nameParts[0]')
         when 'int' then 'Internal'
         when 'hpt' then 
              case when json_extract(name_jsa,'$.nameParts[2]') = 'size0' then 'Utility' else 'Hardpoint' end
         else 'Hull'
       end as slot_type,
       json_extract(name_jsa,'$.nameParts[0]') as np1,
       json_extract(name_jsa,'$.nameParts[1]') as np2,
       json_extract(name_jsa,'$.nameParts[2]') as np3,
       json_extract(name_jsa,'$.nameParts[3]') as np4,
       json_extract(name_jsa,'$.nameParts[4]') as np5,
       name_jsa,
       EngineerModifications,
       "Level",Quality,StorageSlot,StarSystem,MarketID,TransferCost,TransferTime,BuyPrice,Hot
  from csv
),
nme as (
select cmdr,
       slot_type,
       np2 as item_group,
       Name_Localised as Item,
       case slot_type
         when 'Internal' then case when np2 in('dronecontrol') then np4 else np3 end
         when 'Hardpoint' then case when np2 in('mining') then np5 else np4 end
         when 'Utility' then np3
         else np3
       end as "size",
       case slot_type
         when 'Internal' then case when np2 in('dronecontrol') then np5 else np4 end
         when 'Hardpoint' then case when np2 in('mining') then np4 else np3 end
         when 'Utility' then np4
         else np1
       end as "type",
       np1,np2,np3,np4,np5,
--       name_jsa,
       EngineerModifications,"Level",Quality,StorageSlot,
       StarSystem,
       MarketID,TransferCost,TransferTime,BuyPrice,Hot
  from split
)
select cmdr,
       StarSystem,
       slot_type,
       item_group,
       Item,
       case "size"
         when 'small' then '1 Small'
         when 'medium' then '2 Medium'
         when 'large' then '3 Large'
         when 'Huge' then '4 Huge'
         else "size"
       end as "size",
       ifnull("type",'') as "type",
       --np1,np2,np3,np4,np5,
       ifnull(EngineerModifications,'') as blueprint,
       ifnull("Level",'') as "Level",
       ifnull(Quality,'') as Quality,
       --StorageSlot,
       --MarketID,TransferCost,TransferTime,
       BuyPrice,
       Hot 
  from nme
 order by cmdr, slot_type, item_group, size, BuyPrice
;

select * from v_stored_modules;

drop view v_cmdr_module_summary;

create view v_cmdr_module_summary as
with mods as (
    select m.cmdr, m.StarSystem as location, count(*) as modules,
           case e.engineer
                when e.engineer is null then '' else '(home system of engineer ' || e.engineer || ')'
           end as engineer
      from v_stored_modules m
      left outer join engineer e on m.StarSystem = e."system"
  group by  cmdr, StarSystem, engineer 
union
    select cmdr, '~Total (all stored modules)' as location, count(*) as modules, null as engineer 
      from v_stored_modules 
  group by  cmdr, engineer
    )
    select m.cmdr, replace(m.location,'~','') as location, m.modules, 
           ifnull(m.engineer,'') as engineer
      from mods m
     order by m.cmdr, m.location;

select * from v_cmdr_module_summary;

--==================== loadout modules ======================--

select t1.*, ld.* 
  FROM stg_loadout ld, 
       json_tree(ld.jsondata,'$.Modules') t1;

select * from stg_loadout sl where json_extract(jsondata,'$.ShipID')=2;

select json_extract(jsondata,'$.ShipID') as ship_id,
       json_extract(jsondata,'$.ShipName') as ship_name,
       json_extract(jsondata,'$.Modules') as modules,
  from stg_loadout sl where json_extract(jsondata,'$.ShipID')=2;

select t1.*, ld.* 
  FROM stg_loadout ld, 
       json_each(ld.jsondata,'$.Modules') t1
       --json_each(t1.value,'$.Engineering.Modifiers') t2
 where json_extract(ld.jsondata,'$.ShipID')=2;

drop view v_slots_of_interest;

create view v_slots_of_interest as
with slots as (
select json_extract(t1.value,'$.Slot') as slot
  FROM stg_loadout ld, 
       json_each(ld.jsondata,'$.Modules') t1
)
select distinct cast(slot as TEXT) as slot
  from slots
 where slot not like 'Bobble%'
   and slot not like 'Independent%'
   and slot not like 'Decal%'
   and slot not like 'ShipName%'
   and slot not like 'ShipID%'
   and slot not like '%Colour'
   and slot not in('CargoHatch','ShipCockpit','PlanetaryApproachSuite','VesselVoice','PaintJob','FuelTank')
 order by slot;

select * from v_slots_of_interest;

with slots as (
select json_extract(ld.jsondata,'$.ShipID') as ship_id,
       json_extract(ld.jsondata,'$.ShipName') as ship_name, 
       json_extract(t1.value,'$.Slot') as slot, 
       json_extract(t1.value,'$.Item') as item, 
       json_extract(t1.value,'$.Engineering.Engineer') as engineer, 
       json_extract(t1.value,'$.Engineering.BlueprintName') as blueprint, 
       json_extract(t1.value,'$.Engineering.ExperimentalEffect_Localised') as exp_effect, 
       json_extract(t1.value,'$.Engineering.Level') as "level", 
       json_extract(t1.value,'$.Engineering.Quality') as quality, 
       json_extract(t1.value,'$.Engineering.Modifiers') as mods, 
       t1.value as j_slot
  FROM stg_loadout ld, 
       json_each(ld.jsondata,'$.Modules') t1
       --json_each(t1.value,'$.Engineering.Modifiers') t2
 where json_extract(ld.jsondata,'$.ShipID') IN(2)
)
select s.ship_id,
       s.ship_name,
       s.slot,
       s.item,
       s.engineer,
       s.blueprint,
       s.exp_effect,
       s."level",
       s.quality,
       json_extract(s.mods,'$[0].Label') as i0, json_extract(s.mods,'$[0].Value') as v0, json_extract(s.mods,'$[0].OriginalValue') as o0, json_extract(s.mods,'$[0].LessIsGood') as l0,
       json_extract(s.mods,'$[1].Label') as i1, json_extract(s.mods,'$[1].Value') as v1, json_extract(s.mods,'$[1].OriginalValue') as o1, json_extract(s.mods,'$[1].LessIsGood') as l1,
       json_extract(s.mods,'$[2].Label') as i2, json_extract(s.mods,'$[2].Value') as v2, json_extract(s.mods,'$[2].OriginalValue') as o2, json_extract(s.mods,'$[2].LessIsGood') as l2,
       json_extract(s.mods,'$[3].Label') as i3, json_extract(s.mods,'$[3].Value') as v3, json_extract(s.mods,'$[3].OriginalValue') as o3, json_extract(s.mods,'$[3].LessIsGood') as l3,
       json_extract(s.mods,'$[4].Label') as i4, json_extract(s.mods,'$[4].Value') as v4, json_extract(s.mods,'$[4].OriginalValue') as o4, json_extract(s.mods,'$[4].LessIsGood') as l4,
       json_extract(s.mods,'$[5].Label') as i5, json_extract(s.mods,'$[5].Value') as v5, json_extract(s.mods,'$[5].OriginalValue') as o5, json_extract(s.mods,'$[5].LessIsGood') as l5,
       json_extract(s.mods,'$[6].Label') as i6, json_extract(s.mods,'$[6].Value') as v6, json_extract(s.mods,'$[6].OriginalValue') as o6, json_extract(s.mods,'$[6].LessIsGood') as l6,
       json_extract(s.mods,'$[7].Label') as i7, json_extract(s.mods,'$[7].Value') as v7, json_extract(s.mods,'$[7].OriginalValue') as o7, json_extract(s.mods,'$[7].LessIsGood') as l7,
       s.mods
--       ,m.value
  from slots s
 inner join v_slots_of_interest v on v.slot = s.slot 
--  join json_each(j_slot,'$.Engineering.Modifiers') m
;


