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
    const stg = `
        CREATE TABLE IF NOT EXISTS stg_jnl (
          cmdr TEXT,
          jnltime TIMESTAMP,
          event TEXT,
          jsondata TEXT
          )`;
    const clearStg = `
         DELETE FROM stg_jnl`;
    this.run(stg);
    this.run(clearStg);
  }

  insertStg(params) {
    const insStg = `INSERT INTO stg_jnl
    (cmdr, jnltime, event, jsondata)
    VALUES(?, ?, ?, ?)
    `;
    this.run(insStg, params);
  }


  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function dbrun(err) {
        if (err) {
          console.log(`Error running sql ${sql}`);
          console.log(err);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }
}

export default AppDAO;
