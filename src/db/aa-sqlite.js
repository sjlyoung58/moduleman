/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
const sqlite3 = require('sqlite3').verbose();

let db;

exports.db = db;

exports.open = function (path) {
  return new Promise(function (resolve) {
    this.db = new sqlite3.Database(path,
      ((err) => {
        if (err) reject(`Open error: ${err.message}`);
        else resolve(`${path} opened`);
      }));
  });
};

// any query: insert/delete/update
exports.run = function (query) {
  return new Promise(function (resolve, reject) {
    this.db.run(query,
      (err) => {
        if (err) reject(err.message);
        else resolve(true);
      });
  });
};

// first row read
exports.get = function (query, params) {
  return new Promise(function (resolve, reject) {
    this.db.get(query, params, (err, row) => {
      if (err) reject(`Read error: ${err.message}`);
      else {
        resolve(row);
      }
    });
  });
};

// set of rows read
exports.all = function (query, params) {
  return new Promise(function (resolve, reject) {
    if (params == undefined) params = [];

    this.db.all(query, params, (err, rows) => {
      if (err) reject(`Read error: ${err.message}`);
      else {
        resolve(rows);
      }
    });
  });
};

// each row returned one by one
exports.each = function (query, params, action) {
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
};

exports.close = function () {
  return new Promise(function (resolve, _reject) {
    this.db.close();
    resolve(true);
  });
};
