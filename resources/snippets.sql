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
SELECT 'mats' as tab, count(*) FROM stg_mats union 
SELECT 'fsdjump' as tab, count(*) FROM stg_fsdjump union 
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
  UNION 
SELECT ld.cmdr, 
       ld.ship_id, ld.shiptype, 
       ld.shipname, 
       'current ship' as star, 
       json_extract(jsondata,'$.HullValue') + json_extract(jsondata,'$.ModulesValue') as value,
       0 as xfer_cost, 0 as xfer_time,
       ld.jnltime, 
       coalesce(ld.days_old,'<no recent data>') as days_old,
       coalesce(ld.jsondata,'<no recent data>') as jsondata,  
       coalesce(ld.coriolis,'./links.html') as coriolis
  FROM v_loadout ld
 inner join (SELECT cmdr, MAX(jnltime) as jnltime 
  FROM v_loadout group by cmdr) mx
ON ld.jnltime = mx.jnltime order by cmdr, ship_id;

SELECT * FROM v_ship_list;

SELECT * FROM v_stored_ships vss;

SELECT ld.*
  FROM v_loadout ld
where cmdr = 'Infomancer';

--        cmdr, ship_id, shiptype, shipname, star, value, xfer_cost, xfer_time, jnltime, days_old, jsondata, coriolis
SELECT ld.cmdr, 
       ld.ship_id, ld.shiptype, 
       ld.shipname, 
       '<current Ship>' as star, 
       json_extract(jsondata,'$.HullValue') + json_extract(jsondata,'$.ModulesValue') as value,
       0 as xfer_cost, 0 as xfer_time,
       ld.jnltime, 
       coalesce(ld.days_old,'<no recent data>') as days_old,
       coalesce(ld.jsondata,'<no recent data>') as jsondata,  
       coalesce(ld.coriolis,'./links.html') as coriolis
  FROM v_loadout ld
 inner join (SELECT cmdr, MAX(jnltime) as jnltime 
  FROM v_loadout group by cmdr) mx
ON ld.jnltime = mx.jnltime;

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
select ld.cmdr,
       json_extract(ld.jsondata,'$.ShipID') as ship_id,
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
),
item_split as (
select s.cmdr,l.ship_id, l.shiptype, l.shipname, l.star,
       s.slot,
       lower(s.item) as item,
       length(s.item) - length(REPLACE(s.item, '_', '')) as usc,
       '{"itemParts":["' || replace(replace(replace(lower(s.item),'_','","'),',"item;',''),'$','') || '"]}' as item_jsa, --json(' { "this" : "is", "a": [ "test" ] } ') → '{"this":"is","a":["test"]}'
       s.engineer,
       s.blueprint,
       s.exp_effect,
       s."level",
       s.quality,
       s.mods,
       json_array_length(s.mods) as mod_count
  from slots s
 inner join v_slots_of_interest v on v.slot = s.slot
 inner join v_ship_list l on l.cmdr = s.cmdr and l.ship_id = s.ship_id
),
decode as (
select cmdr, ship_id, shiptype, shipname, star, 
       slot, item,
       case lower(json_extract(item_jsa,'$.itemParts[0]'))
         when 'int' then 'Internal'
         when 'hpt' then 
              case when json_extract(item_jsa,'$.itemParts[2]') = 'size0' 
                     or json_extract(item_jsa,'$.itemParts[' || usc || ']') = 'tiny' then 'Utility' 
              else 'Hardpoint' 
              end 
         else 'Hull'
       end as slot_type,
       json_extract(item_jsa,'$.itemParts[0]') as it1,
       json_extract(item_jsa,'$.itemParts[1]') as it2,
       json_extract(item_jsa,'$.itemParts[2]') as it3,
       json_extract(item_jsa,'$.itemParts[3]') as it4,
       json_extract(item_jsa,'$.itemParts[4]') as it5,
       item, 
       item_jsa, usc,
       json_extract(item_jsa,'$.itemParts[' || usc || ']') as last_part,
       engineer, 
       blueprint, 
       exp_effect, 
       "level", 
       quality, 
       mods, 
       mod_count 
  from item_split
 ),
 pretty as (
 select cmdr,  ship_id,  shiptype,  shipname,  star,  
        slot_type,  
        slot,
       case slot_type when 'Hull' then json_extract(item_jsa,'$.itemParts[' || (usc - 1) || ']') else it2 end as item_group,
       case slot_type
         when 'Hardpoint' then 
               case when it2 in('mining') then it3
                    when it2 in('guardian') then it2 || '_' || it3
                    else it2 || coalesce('_' || it5,'')
               end
         when 'Hull' then replace(item, '_' || last_part,'')
         when 'Internal' then case when it2 in('dronecontrol') then it2 || '_' || it5 else it2 || '_' || it4 end
         else it2 --|| '_' || coalesce(lower(it5),'')
       end as "item",        
       case slot_type
         when 'Internal' then case when it2 in('dronecontrol') then it4 else it3 end
         when 'Hardpoint' then case when it2 in('mining','guardian') then it5 else it4 end
         when 'Utility' then it3
         when 'Hull' then ''
         else it3
       end as "size",
       case slot_type
         when 'Internal' then case when it2 in('dronecontrol') then it5 else it4 end
         when 'Hardpoint' then case when it2 in('mining','guardian') then it4 else it3 end
         when 'Utility' then it4
         when 'Hull' then last_part
         else it1
       end as "type", 
--     it1,  it2,  it3,  it4, it5,  
--     item as full_desc,  
--     item_jsa,  usc,  
        engineer,  blueprint,  exp_effect,  "level",  quality,  mods,  mod_count
   from decode
)
select cmdr, ship_id, shiptype, shipname, star, slot_type, slot, item_group, item,
       case "size"
         when 'small' then '1 Small'
         when 'medium' then '2 Medium'
         when 'large' then '3 Large'
         when 'Huge' then '4 Huge'
         else "size"
       end as "size",
       "type", engineer, blueprint, exp_effect, "level", quality, mods, mod_count
  from pretty
 where quality = 1
 order by cmdr, slot_type, item, size, level, quality
;

select * from stg_loadout sl;

SELECT distinct shiptype, shiptypel 
  FROM v_stored_ships 
 where replace(shiptype,'_','$') like '%$%';

--===================== materials =====================--

select mat.cmdr,
       tre.*,
       date(mat.jnltime) || ' ' || time(mat.jnltime) as jnltime,
       mat.jsondata 
 from stg_mats mat, json_tree(mat.jsondata,'$') tre;

drop view v_materials;

create view v_materials as
with mats as (
select mat.cmdr, mat.jnltime,
       ech.*
 from stg_mats mat, json_each(mat.jsondata,'$.Raw') ech
union
select mat.cmdr, mat.jnltime,
       ech.*
 from stg_mats mat, json_each(mat.jsondata,'$.Encoded') ech
union
select mat.cmdr, mat.jnltime,
       ech.*
 from stg_mats mat, json_each(mat.jsondata,'$.Manufactured') ech
),
pretty as (
select cmdr, 
       date(jnltime) || ' ' || time(jnltime) as jnltime,
       replace(path,'$.','') as type, 
       coalesce(json_extract(value, '$.Name_Localised'),json_extract(value, '$.Name')) as name,
       json_extract(value, '$.Count') as qty
       --,value
  from mats
)
select cmdr, 
       jnltime, 
       "type", 
       (UPPER(SUBSTR(name, 1, 1)) || SUBSTR(name, 2)) as name, 
       qty
  from pretty 
 order by cmdr, "type" desc, name;

-- (UPPER(SUBSTR(name, 1, 1)) || SUBSTR(name, 2)), 


select cmdr, "type", name, qty from v_materials;

SELECT distinct cmdr, jnltime FROM v_materials;

--===================== FSDJump =====================--

SELECT cmdr, jnltime, jsondata
FROM stg_fsdjump;

drop view v_fsdjump;

create view v_fsdjump as
with fsd as (
select fsd.cmdr, 
       date(fsd.jnltime) as jnldate, time(fsd.jnltime) as jnltime,
       round(julianday('now') - fsd.jnltime) as days_old,
       json_extract(jsondata,'$.StarSystem') as system,
       json_extract(jsondata,'$.Powers[0]') as power,
       json_extract(jsondata,'$.PowerplayState') as pp_state,
       json_extract(value,'$.Name') as faction,
       json_extract(jsondata,'$.SystemFaction.Name') = json_extract(value,'$.Name') as cf,
       json_extract(value,'$.Influence') * 100 as influence,
       json_extract(value,'$.FactionState') as faction_state,
       --json_extract(value,'$.ActiveStates') as active,
       case when json_extract(value,'$.ActiveStates') is not null then
                  replace (json_array(json_extract(value,'$.ActiveStates[0].State'),
                                      json_extract(value,'$.ActiveStates[1].State'),
                                      json_extract(value,'$.ActiveStates[2].State')),',null','')
            else ''
        end as active,
       case when json_extract(value,'$.PendingStates') is not null then
                  replace (json_array(json_extract(value,'$.PendingStates[0].State'),
                                      json_extract(value,'$.PendingStates[1].State'),
                                      json_extract(value,'$.PendingStates[2].State')),',null','')
            else ''
        end as pending,
       json_extract(value,'$.Happiness_Localised') as happiness,
       json_extract(value,'$.Allegiance') as allegiance,
       json_extract(value,'$.MyReputation') as my_reputation,
       ech.value
 from stg_fsdjump fsd, json_each(fsd.jsondata,'$.Factions') ech
),
latest as (
select system, jnldate, max(jnltime) as jnltime, count(*)
 from fsd
 group by  system, jnldate
)
select f.cmdr, f.jnldate, f.jnltime, f.days_old, ifnull(f."system",'') as "system", 
       ifnull(f.power,'') as power, ifnull(f.pp_state,'') as pp_state, 
       ifnull(f.faction,'') as faction, ifnull(f.cf,'') as cf, 
       ifnull(f.influence,'') as influence, 
       ifnull(f.faction_state,'') as faction_state, 
       replace(f.active,'"','') as active, replace(f.pending,'"','') as pending, 
       ifnull(f.happiness,'') as happiness, 
       ifnull(f.allegiance,'') as allegiance, 
       ifnull(f.my_reputation,'') as my_reputation 
  from fsd f
 inner join latest l on f.system = l.system and f.jnldate = l.jnldate and f.jnltime = l.jnltime
 order by  f.system, f.jnldate desc, f.influence desc;

select *
  from v_fsdjump;

drop view v_conflicts; 

create view v_conflicts as
with conf as (
 SELECT --fsd.cmdr, 
       date(fsd.jnltime) as jnldate, time(fsd.jnltime) as jnltime,
       round(julianday('now') - fsd.jnltime) as days_old,
       json_extract(fsd.jsondata,'$.StarSystem') as system,
       ech.value
  FROM stg_fsdjump fsd,
       json_tree(jsondata,'$.Conflicts') ech
 WHERE json_extract(fsd.jsondata,'$.Conflicts') is not null
   and ech.fullkey like '%conflicts[%]'
),
latest as (
select system, jnldate, max(jnltime) as jnltime, count(*)
 from conf
 group by  system, jnldate
),
byday as (
select f.jnldate, 
       --f.jnltime, 
       f.days_old, 
       f."system", 
       json_extract(f.value,'$.WarType') as type,
       json_extract(f.value,'$.Status') as status,
       json_extract(f.value,'$.Faction1.WonDays') || '-' || json_extract(f.value,'$.Faction2.WonDays') as score,
       json_extract(f.value,'$.Faction1.Name') as fac1,
       json_extract(f.value,'$.Faction2.Name') as fac2,
       json_extract(f.value,'$.Faction1.WonDays') as won1,
       json_extract(f.value,'$.Faction1.Stake') as at_stake1,
       json_extract(f.value,'$.Faction2.WonDays') as won2,
       json_extract(f.value,'$.Faction2.Stake') as at_stake2
       --,f.value
  from conf f
 inner join latest l on f.system = l.system and f.jnldate = l.jnldate and f.jnltime = l.jnltime
)
select * from byday
order by system, fac1, fac2, at_stake1, at_stake2, jnldate desc
;

select * from v_conflicts;

select * from v_conflicts
 where system = 'LTT 9315';

select '2020-06-29' as d, JULIANDAY('2020-06-29') as jd, JULIANDAY('2020-06-29') -10 as jd2, date(JULIANDAY('2020-06-29') -10) as d2; 

select date('now'), date(JULIANDAY('now') -10) as d2;

select min(1,2,3,null,4,-1,5);

drop view v_conflict_summary;

create view v_conflict_summary as 
with curr as (
select system, type, fac1, fac2, at_stake1, at_stake2, max(jnldate) as max_date, 
       count(*) as kount
  from v_conflicts
 group by system, type, fac1, fac2, at_stake1, at_stake2
),
conf2 as (
select c.*, 
       v.status, 
       v.jnldate, 
       v.score, 
       v.won1, 
       v.won2, 
       case v.status when 'pending' then jnldate else null end as pending_date,
       case v.status when 'active' then jnldate else null end as active_date,
       case v.status when '' then jnldate else null end as blank_date
  from curr c
 inner join v_conflicts v on c.system = v."system" and c.type = v."type" 
                         and c.fac1 = v.fac1 and c.fac2 = v.fac2 and c.at_stake1 = v.at_stake1 and c.at_stake2 = v.at_stake2 
                         and v.jnldate >= date(JULIANDAY(c.max_date) -10)
),
onel as (
select "system",  "type",  fac1,  fac2,  at_stake1,  at_stake2,  
       max_date,  
       jnldate,    
       max(pending_date) as mr_pend,  
       max(active_date) as mr_active,  
       min(active_date) as lr_active,  
       max(blank_date) as mr_blank, 
       min(blank_date) as lr_blank, 
       max(score) as score,
       max(won1) + max(won2) as min_days
  from conf2
 group by "system",  "type",  fac1,  fac2,  at_stake1,  at_stake2,  
       max_date
),
final as (
select "system",  "type",  fac1,  fac2,  at_stake1,  at_stake2,
       min(jnldate, ifnull(mr_pend, max_date), ifnull(lr_active, max_date), ifnull(lr_blank, max_date), date(JULIANDAY(max_date) - (min_days + 1))) as lowest_date,
       coalesce(mr_pend, case when lr_blank > jnldate then jnldate else lr_blank end, lr_active) as start_date,
       score, min_days
       ,max_date, jnldate, mr_pend, mr_active, lr_active, mr_blank, lr_blank
  from onel
 where max_date >= date(JULIANDAY('now') -10)
)
select c."system", c."type", 
       round(f.influence,2) as inf, 
       c.fac1, c.fac2, 
       c.at_stake1, c.at_stake2, 
       c.lowest_date as min_date, 
       c.max_date,
       julianday(coalesce(mr_active, max_date)) - julianday(lowest_date) as est_day, 
       c.score
--     , min_days, jnldate, mr_pend, mr_active, lr_active, mr_blank, lr_blank
  from final c
 left outer join v_fsdjump f on c.system = f."system" and c.fac1 = f.faction and f.jnldate = c.max_date
;

drop view v_conflict_pretty;

create view v_conflict_pretty as
SELECT system || ': ' || fac1 || 
       case type when 'election' then ' are in an ' else ' are in a ' end || 
       case type when 'civilwar' then 'civil war' else type end  || 
       ' with ' ||  fac2 || ', Status: Day ' || printf('%d', est_day) || ', score ' || score ||
       ', at risk ' || case at_stake1 when '' then 'nothing' else at_stake1 end || '/' ||
       case at_stake2 when '' then 'nothing' else at_stake2 end as description
  FROM v_conflict_summary;

select * from v_conflict_pretty;
 
--==================== work out latest FSDJump message processed ===============--
select * from stg_fsdjump;

SELECT datetime('2018-02-27T11:59:59Z') as dtm,
       datetime(julianday(datetime('2018-02-27T11:59:59Z')) -1) as dtm2;
       --date(fsd.jnltime) as jnldate, time(fsd.jnltime) as jnltime,
       
drop view v_latest_fsd;

create view v_latest_fsd as
-- view to return latest FSDJump message processed to facilitate incremental journal scan
with latest as (
select ifnull(max(json_extract(jsondata,'$.timestamp')),'2018-02-28T11:59:59Z') as fsd 
  from stg_fsdjump
),
dbefore as (
select fsd as latest_fsd,
       datetime(julianday(datetime(fsd)) -1) as process_from,
       case when fsd = '2018-02-28T11:59:59Z' then 'Full' else 'Incremental' end as scan_type
  from latest
)
select latest_fsd, scan_type,
       substr(process_from,3,2) || substr(process_from,6,2) || substr(process_from,9,2) ||
       substr(process_from,12,2) || substr(process_from,15,2) || substr(process_from,18,2) as jnl_from
 from dbefore;

select * from v_latest_fsd;

--========================================================--

select *
  from stg_fsdjump
 where round(julianday('now') - jnltime) <= 15;us

select jsondata 
  from stg_fsdjump
 where round(julianday('now') - jnltime) <= 15;

select cmdr
  from stg_fsdjump
 where cmdr <> 'none'
group by cmdr order by count(*) desc limit 1;
