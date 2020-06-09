/* eslint-disable no-console */
import sqlite3 from 'sqlite3';

class AppDAO {
  constructor(dbFilePath) {
    this.path = dbFilePath;
    this.db = undefined;
    // this.db = this.open(dbFilePath);

    // this.db = new sqlite3.Database(dbFilePath, sqlite3.OPEN_READWRITE, (err) => {
    //   if (err) {
    //     console.log('Could not connect to database', err);
    //   } else {
    //     console.log('Connected to database');
    //     // this.initialise();
    //   }
    // });
  }

  async init() {
    console.log('Opening database at ', this.path);
    this.db = await this.open(this.path);
    console.log('Database opened ', this.db);
  }

  async dbSetup() {
    await this.run2('DELETE FROM stg_jnl');
    await this.run2('DELETE FROM stg_loadout');
    await this.run2('DELETE FROM stg_st_mods');
    await this.run2('DELETE FROM stg_st_ships');
  }

  upsertStShips(params) {
    const insStg = `INSERT INTO stg_st_ships
    (cmdr, jnltime, jsondata)
    VALUES(?, julianday(?), ?)
    ON CONFLICT(cmdr) DO UPDATE
      SET jnltime = excluded.jnltime, jsondata = excluded.jsondata
    WHERE excluded.jnltime > stg_st_ships.jnltime `;

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


  upsertMats(params) {
    const insStg = `INSERT INTO stg_mats
    (cmdr, jnltime, jsondata)
    VALUES(?, julianday(?), ?)
    ON CONFLICT(cmdr) DO UPDATE
      SET jnltime = excluded.jnltime, jsondata = excluded.jsondata
    WHERE excluded.jnltime > stg_mats.jnltime 
    `;

    this.run(insStg, params);
    process.stdout.write('t');
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

  // Promise based functions for async await usage

  run2(query) {
    return new Promise(((resolve, reject) => {
      this.db.run(query,
        (err) => {
          if (err) reject(err.message);
          else resolve(true);
        });
    }));
  }

  all(query, params) {
    return new Promise(((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else {
          resolve(rows);
        }
      });
    }));
  }

  // eslint-disable-next-line class-methods-use-this
  async open(path) {
    return new Promise(((resolve, reject) => {
      const database = new sqlite3.Database(path,
        ((err) => {
          if (err) reject(err);
          else resolve(database);
        }));
    }));
  }
}

export default AppDAO;
