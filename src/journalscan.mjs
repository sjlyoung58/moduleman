/* eslint-disable import/extensions */
/* eslint-disable no-console */
import fs from 'fs';
import lineReader from 'line-reader';
// import path from 'path';
// import datetime from 'node-datetime';
import zlib from 'zlib';
import URLSafeBase64 from 'urlsafe-base64';

import config from './config/config.mjs';
import release from './version.mjs';
import AppDAO from './db/dao.mjs';
// import AppDAO from './db/dao-as.mjs';

let dao;

function processJournals(startFrom) {
  console.log(`Fleet Manager version ${release}`);
  console.log(`Reading journals from ${config.jnl.path} starting at ${startFrom}`);
  console.log('l = loadout found/processed, m = modules, s = shipyard, t = materials, f = fsdjump');
  fs.readdir(config.jnl.path, (err, files) => {
    if (err) {
      console.log('Error getting directory information.');
    } else {
      files.forEach((file) => {
        const nameParts = file.split('.');
        // only process 27 Feb 2018 midday onwards 3.0 ED: Beyond – Chapter One
        // only process Journal, not JournalBeta
        if (nameParts[0] === 'Journal' && nameParts[1] > startFrom) {
          processJournal(`${config.jnl.path}${file}`);
        } else {
          // console.log(`${file} rejected`);
        }
      });
    }
  });
}

function daysDiff(timestamp1, timestamp2) {
  const difference = timestamp1 - timestamp2;
  const daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
  return daysDifference;
}

function processJournal(file) {
  let cmdr = 'none';
  lineReader.eachLine(file, (line) => {
    const entry = parseJSON(line, file);
    const ts = entry.timestamp;
    const daysOld = daysDiff(new Date(), new Date(ts));
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
        process.stdout.write('m');
        // console.log(`${file} - ${cmdr} - ${new Date(entry.timestamp)} - ${entry.event}`);
        break;
      case 'Materials':
        dao.upsertMats([cmdr, ts, line]);
        process.stdout.write('t');
        // console.log(`${file} - ${cmdr} - ${new Date(entry.timestamp)} - ${entry.event}`);
        break;
      case 'StoredShips':
        dao.upsertStShips([cmdr, ts, line]);
        process.stdout.write('s');
        // console.log(`${file} - ${cmdr} - ${new Date(entry.timestamp)} - ${entry.event}`);
        break;
      case 'Loadout':
        ship = JSON.stringify(entry);
        buf = Buffer.from(ship, 'utf-8');
        zship = URLSafeBase64.encode(zlib.gzipSync(buf));
        coriolis = `https://coriolis.io/import?data=${zship}`;
        dao.upsertLoadout([cmdr, entry.ShipID, ts, ship, coriolis]);
        process.stdout.write('l');
        break;
      case 'FSDJump':
        if (daysOld < 30) {
          dao.upsertFSDJump([cmdr, ts, line]);
          process.stdout.write('f');
          // console.log('FSDJump ', daysOld);
        }
        break;
      default:
        break;
    }
  });
}

// function to ignore corrupt lines in journals
function parseJSON(json, jnlfile) {
  let parsed = JSON.parse(`{ "timestamp":"${new Date().toISOString}",
                             "event":"ParseError", "file":"${jnlfile.replace(/\\/g, '/')}" }`);
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    console.log(`Bad JSON found in file ${jnlfile} - line ignored:${json}`);
  }
  return parsed; // will be ParseError if problem input
}


async function main() {
  dao = new AppDAO(config.db.path);
  await dao.init();
  const latestFsd = await dao.all('select * from v_latest_fsd', []);
  console.log(`Latest FSDJump processed from ${latestFsd[0].latest_fsd}, scan type ${latestFsd[0].scan_type}`
           + `, processing journals > ${latestFsd[0].jnl_from}`);
  processJournals(latestFsd[0].jnl_from);
}

main();
