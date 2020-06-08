/* eslint-disable no-console */
/* eslint-disable import/extensions */
import fs from 'fs';
// import {
//     open as sqlOpen, run as sqlRun, each as sqlEach,
//     get as sqlGet, close as sqlClose, all as sqlAll,
//   } from './aa-sqlite.js';
import * as sqlite from './aa-sqlite.mjs';

const { sqlOpen } = sqlite.open;
const { sqlRun } = sqlite.run;
const { sqlEach } = sqlite.each;
const { sqlGet } = sqlite.get;
const { sqlClose } = sqlite.close;
const { sqlAll } = sqlite.all;


async function mainApp() {
  console.log(await sqlite.open('./users.db'));

  // Adds a table

  let r = await sqlRun('CREATE TABLE users(ID integer NOT NULL PRIMARY KEY, name text, city text)');
  if (r) console.log('Table created');

  // Fills the table

  const users = {
    Naomi: 'chicago',
    Julia: 'Frisco',
    Amy: 'New York',
    Scarlett: 'Austin',
    Amy: 'Seattle',
  };

  let id = 1;
  for (const x in users) {
    const entry = `'${id}','${x}','${users[x]}'`;
    var sql = `INSERT INTO users(ID, name, city) VALUES (${entry})`;
    r = await sqlRun(sql);
    if (r) console.log('Inserted.');
    id++;
  }

  // Starting a new cycle to access the data

  await sqlClose();
  await sqlOpen('./users.db');

  console.log('Select one user:');

  var sql = "SELECT ID, name, city FROM users WHERE name='Naomi'";
  r = await sqlGet(sql);
  console.log('Read:', r.ID, r.name, r.city);

  console.log('Get all users:');

  sql = 'SELECT * FROM users';
  r = await sqlAll(sql, []);
  r.forEach((row) => {
    console.log('Read:', row.ID, row.name, row.city);
  });

  console.log('Get some users:');

  sql = 'SELECT * FROM users WHERE name=?';
  r = await sqlAll(sql, ['Amy']);
  r.forEach((row) => {
    console.log('Read:', row.ID, row.name, row.city);
  });

  console.log('One by one:');

  sql = 'SELECT * FROM users';
  r = await sqlEach(sql, [], (row) => {
    console.log('Read:', row.ID, row.name, row.city);
  });

  if (r) console.log('Done.');

  sqlClose();
}

try {
  fs.unlinkSync('./users.db');
} catch (e) {
}

mainApp();
