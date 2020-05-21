/* eslint-disable import/extensions */
/* eslint-disable no-console */
import fs from 'fs';
import lineReader from 'line-reader';
// import path from 'path';
// import datetime from 'node-datetime';
import zlib from 'zlib';
import URLSafeBase64 from 'urlsafe-base64';

import config from './config/config.mjs';

import AppDAO from './db/dao.mjs';

const dao = new AppDAO(config.db.path);

dao.initialise();

processJournals();


function processJournals() {
  console.log(`Reading journals from ${config.jnl.path}`);
  fs.readdir(config.jnl.path, (err, files) => {
    if (err) {
      console.log('Error getting directory information.');
    } else {
      files.forEach((file) => {
        const nameParts = file.split('.');
        // only process 27 Feb 2018 midday onwards 3.0 ED: Beyond – Chapter One
        // only process Journal, not JournalBeta
        if (nameParts[0] === 'Journal' && nameParts[1] > '180227119999') {
          processJournal(`${config.jnl.path}${file}`);
        } else {
          // console.log(`${file} rejected`);
        }
      });
    }
  });
}

function processJournal(file) {
  // console.log(`processing ${file}`);
  let cmdr = 'none';
  lineReader.eachLine(file, (line) => {
    const entry = parseJSON(line,file);
    const ts = entry.timestamp;
    delete entry.timestamp;
    let ship;
    let buf;
    let zship;
    let coriolis;
    switch (entry.event) {
      case 'Commander':
        cmdr = entry.Name;
        // console.log(entry.Name);
        break;
      case 'StoredModules':
        dao.upsertStMods([cmdr, ts, line]);
        // console.log(`${file} - ${cmdr} - ${new Date(entry.timestamp)} - ${entry.event}`);
        break;
      case 'StoredShips':
        dao.upsertStShips([cmdr, ts, line]);
        // console.log(`${file} - ${cmdr} - ${new Date(entry.timestamp)} - ${entry.event}`);
        break;
      case 'Loadout':
        ship = JSON.stringify(entry);
        buf = Buffer.from(ship, 'utf-8');
        zship = URLSafeBase64.encode(zlib.gzipSync(buf));
        coriolis = `https://coriolis.io/import?data=${zship}`;
        dao.upsertLoadout([cmdr, entry.ShipID, ts, ship, coriolis]);
        break;
      default:
        break;
    }
  });
}

// function to ignore corrupt lines in journals
function parseJSON (json, file) {
    var parsed = JSON.parse(`{ "timestamp":"${new Date().toISOString}", "event":"ParseError" }`);  
    try {
      parsed = JSON.parse(json)
    } catch (e) {
      console.log(`Bad JSON found in file ${file} - line ignored:${json}`);
    } 
    return parsed // will be ParseError if problem input
  }
  
