/* eslint-disable import/extensions */
/* eslint-disable no-console */
import fs from 'fs';
import lineReader from 'line-reader';
// import sqlite3 from 'sqlite3';
// import path from 'path';
// import datetime from 'node-datetime';
// import zlib from 'zlib';
// import URLSafeBase64 from 'urlsafe-base64';

import config from './config/config.mjs';

import AppDAO from './db/dao.mjs';

const dao = new AppDAO(config.db.path);

console.log(dao.toString());

fs.readdir(config.jnlpath, (err, files) => {
  if (err) {
    console.log('Error getting directory information.');
  } else {
    files.forEach((file) => {
      const nameParts = file.split('.');
      // if (nameParts[0] === 'Journal') {
      if (nameParts[0] === 'Journal' && nameParts[1] > '199999999999') { // only journals from 2018 onwards
      // if (nameParts[0] === 'Journal' && nameParts[1] > '200508000000') {
        console.log(`${file} is a journal`);
        processJournal(`${config.jnlpath}${file}`);
      } else {
        // console.log(`${file} rejected`);
      }
    });
  }
});

function processJournal(file) {
  console.log(`processing ${file}`);
  let cmdr = 'none';
  lineReader.eachLine(file, (line) => {
    const entry = JSON.parse(line);
    switch (entry.event) {
      case 'Commander':
        cmdr = entry.Name;
        // console.log(entry.Name);
        break;
      case 'StoredModules':
        dao.insertStg([cmdr, new Date(entry.timestamp), entry.event, line]);
        // console.log(`${file} - ${cmdr} - ${new Date(entry.timestamp)} - ${entry.event}`);
        break;
      case 'StoredShips':
        dao.insertStg([cmdr, new Date(entry.timestamp), entry.event, line]);
        // console.log(`${file} - ${cmdr} - ${new Date(entry.timestamp)} - ${entry.event}`);
        break;
      case 'Loadout':
        dao.insertStg([cmdr, new Date(entry.timestamp), entry.event, line]);
        // console.log(`${file} - ${cmdr} - ${new Date(entry.timestamp)} - ${entry.event} - ${entry.ShipID} - ${entry.Ship} - ${entry.ShipName}`);
        break;
      default:
        break;
    }
  });
}
