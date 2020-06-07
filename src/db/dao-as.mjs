/* eslint-disable no-console */
import Database from 'sqlite-async';
// const Database = require('sqlite-async');

// eslint-disable-next-line import/prefer-default-export
export default class AppDAO {
  constructor(dbFilePath) {
    console.log('Calling database constructor for ', dbFilePath);
    Database.open(dbFilePath, Database.OPEN_READWRITE).then((_db) => {
      console.log('Connected to database');
      this.db = _db;
    }).catch((err) => {
      console.log('Could not connect to database', err);
    });

    // this.db = new sqlite-async.Database(dbFilePath, sqlite3.OPEN_READWRITE, (err) => {
    //   if (err) {
    //     console.log('Could not connect to database', err);
    //   } else {
    //     console.log('Connected to database');
    //     // this.initialise();
    //   }
    // });
  }

  // initialise1() {
  //   this.db.transaction( this.db => {
  //     return Promise.all([
  //         this.db.run('DELETE FROM stg_jnl'),
  //         this.db.run('DELETE FROM stg_loadout'),
  //         this.db.run('DELETE FROM stg_st_mods'),
  //         this.db.run('DELETE FROM stg_st_ships')
  //     ])
  // })

  // }

  initialise() {
    return this.db.transaction((db) => Promise.all([
      this.db.run('DELETE FROM stg_jnl'),
      this.db.run('DELETE FROM stg_loadout'),
      this.db.run('DELETE FROM stg_st_mods'),
      this.db.run('DELETE FROM stg_st_ships'),
    ]));
  }

  upsertStShips(params) {
    const insStg = `INSERT INTO stg_st_ships
    (cmdr, jnltime, jsondata)
    VALUES(?, julianday(?), ?)
    ON CONFLICT(cmdr) DO UPDATE
      SET jnltime = excluded.jnltime, jsondata = excluded.jsondata
    WHERE excluded.jnltime > stg_st_ships.jnltime`;

    this.run(insStg, params);
    process.stdout.write('s');
  }

  upsertLoadout(params) {
    const insStg = `INSERT INTO stg_loadout
    (cmdr, ship_id, jnltime, jsondata, coriolis)
    VALUES(?, ?, julianday(?), ?, ?)
      ON CONFLICT(cmdr, ship_id) DO UPDATE
        SET jnltime = excluded.jnltime, jsondata = excluded.jsondata, coriolis = excluded.coriolis
      WHERE excluded.jnltime > stg_loadout.jnltime 
    `;

    this.run(insStg, params);
    process.stdout.write('l');
  }

  upsertStMods(params) {
    const insStg = `INSERT INTO stg_st_mods
    (cmdr, jnltime, jsondata)
    VALUES(?, julianday(?), ?)
    ON CONFLICT(cmdr) DO UPDATE
      SET jnltime = excluded.jnltime, jsondata = excluded.jsondata
    WHERE excluded.jnltime > stg_st_mods.jnltime 
    `;

    this.run(insStg, params);
    process.stdout.write('m');
  }

  insertStg(params) {
    const insStg = `INSERT INTO stg_jnl
    (cmdr, jnltime, event, jsondata)
    VALUES(?, julianday(?), ?, ?)
    `;

    this.run(insStg, params);
  }

  run(sql, params = []) {
    this.db.run(sql, params, (err) => {
      if (err) {
        console.log(`Error running sql ${sql}`);
        console.log(err);
      }
    });
  }
}

// exports.AppDAO = AppDAO();
