/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
// const sqlite3 = require('sqlite3').verbose();
import sqlite3 from 'sqlite3';

// eslint-disable-next-line import/no-mutable-exports
// let db;


// exports db = db;


export function open (path) {
  return new Promise(function (resolve) {
    this.db = new sqlite3.Database(path,
      ((err) => {
        if (err) reject(`Open error: ${err.message}`);
        else resolve(`${path} opened`);
      }));
  });
}

// any query: insert/delete/update
export function run (query) {
  return new Promise(function (resolve, reject) {
    this.db.run(query,
      (err) => {
        if (err) reject(err.message);
        else resolve(true);
      });
  });
}

// first row read
export function get (query, params) {
  return new Promise(function (resolve, reject) {
    this.db.get(query, params, (err, row) => {
      if (err) reject(`Read error: ${err.message}`);
      else {
        resolve(row);
      }
    });
  });
}

// set of rows read
export function all (query, params) {
  return new Promise(function (resolve, reject) {
    if (params == undefined) params = [];

    this.db.all(query, params, (err, rows) => {
      if (err) reject(`Read error: ${err.message}`);
      else {
        resolve(rows);
      }
    });
  });
}

// each row returned one by one
export function each (query, params, action) {
  return new Promise(function (resolve, reject) {
    const { db } = this;
    db.serialize(() => {
      db.each(query, params, (err, row) => {
        if (err) reject(`Read error: ${err.message}`);
        else if (row) {
          action(row);
        }
      });
      db.get('', (_err, _row) => {
        resolve(true);
      });
    });
  });
}

export function close () {
  return new Promise(function (resolve, _reject) {
    this.db.close();
    resolve(true);
  });
}
