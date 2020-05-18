/* eslint-disable no-console */
import sqlite3 from 'sqlite3';

class AppDAO {
  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.log('Could not connect to database', err);
      } else {
        console.log('Connected to database');
        this.initialise();
      }
    });
  }

  initialise() {
    this.run('DELETE FROM stg_jnl');
    this.run('DELETE FROM stg_loadout');
    this.run('DELETE FROM stg_st_mods');
    this.run('DELETE FROM stg_st_ships');
  }

  insertStShips(params) {
    const insStg = `INSERT INTO stg_st_ships
    (cmdr, jnltime, jsondata)
    VALUES(?, julianday(?), ?)
    `;

    this.run(insStg, params);
  }

  insertLoadout(params) {
    const insStg = `INSERT INTO stg_loadout
    (cmdr, jnltime, ship_id, jsondata, coriolis)
    VALUES(?, julianday(?), ?, ?, ?)
    `;

    this.run(insStg, params);
  }

  insertStMods(params) {
    const insStg = `INSERT INTO stg_st_mods
    (cmdr, jnltime, jsondata)
    VALUES(?, julianday(?), ?)
    `;

    this.run(insStg, params);
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

export default AppDAO;
