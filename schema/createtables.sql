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
    CONSTRAINT st_ships_pk PRIMARY KEY (cmdr));

CREATE TABLE IF NOT EXISTS stg_st_mods (
    cmdr TEXT,
    jnltime REAL, 
    jsondata TEXT,
    CONSTRAINT st_mods_pk PRIMARY KEY (cmdr));

CREATE TABLE IF NOT EXISTS stg_mats (
    cmdr TEXT,
    jnltime REAL, 
    jsondata TEXT,
    CONSTRAINT st_mats_pk PRIMARY KEY (cmdr));

CREATE TABLE IF NOT EXISTS stg_fsdjump (
    cmdr TEXT,
    jnltime REAL, 
    jsondata TEXT,
    CONSTRAINT st_fsdj_pk PRIMARY KEY (cmdr, jnltime));

CREATE TABLE IF NOT EXISTS stg_fsssignal (
    cmdr TEXT,
    signal TEXT,
    jnltime REAL, 
    jsondata TEXT,
    CONSTRAINT st_fsss_pk PRIMARY KEY (cmdr, signal, jnltime));

CREATE TABLE IF NOT EXISTS stg_carrierstats (
    cmdr TEXT,
    jnltime REAL, 
    jsondata TEXT,
    CONSTRAINT st_carrst_pk PRIMARY KEY (cmdr));

CREATE TABLE engineer (
	engineer TEXT,
	base TEXT,
	system_id INTEGER,
	"system" TEXT,
	needs_permit TEXT,
	distance_to_star INTEGER,
	has_market TEXT
);

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
