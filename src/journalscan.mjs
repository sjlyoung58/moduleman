/* eslint-disable no-console */
import fs from 'fs';
import lineReader from 'line-reader';
// import path from 'path';
// import datetime from 'node-datetime';
// import zlib from 'zlib';
// import URLSafeBase64 from 'urlsafe-base64';

// eslint-disable-next-line import/extensions
import config from './config/config.mjs';

// const output = fs.readFileSync('testjournals/Cargo.json');

// console.log(config.db.user);
// console.log(output.toString());

fs.readdir(config.jnlpath, (err, files) => {
  if (err) {
    console.log('Error getting directory information.');
  } else {
    files.forEach((file) => {
      const nameParts = file.split('.');
      // if (nameParts[0] === 'Journal') {
      if (nameParts[0] === 'Journal' && nameParts[1] > '179999999999') { // only journals from 2018 onwards
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
        console.log(`${file} - ${cmdr} - ${new Date(entry.timestamp)} - ${entry.event}`);
        break;
      case 'StoredShips':
        console.log(`${file} - ${cmdr} - ${new Date(entry.timestamp)} - ${entry.event}`);
        break;
      case 'Loadout':
        console.log(`${file} - ${cmdr} - ${new Date(entry.timestamp)} - ${entry.event} - ${entry.ShipID} - ${entry.Ship} - ${entry.ShipName}`);
        break;
      default:
        break;
    }
  });
}
