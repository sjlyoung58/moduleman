/* eslint-disable import/extensions */
/* eslint-disable no-console */
import fs from 'fs';

import config from './config/config.mjs';
import AppDAO from './db/dao.mjs';

const dao = new AppDAO(config.db.path);

console.log('Creating results');

writeLinks();

writeStoredModules();

function writeLinks() {
  const logStream = fs.createWriteStream('./public/links.html', { flags: 'w' });

  const cmdrSql = `  SELECT cmdr, json_extract(jsondata,'$.StarSystem') as star, json_extract(jsondata,'$.StationName') as station,
                            round(julianday('now') - jnltime) as days_old FROM stg_st_ships`;

  const shipSql = `select cmdr, shiptype, shipname, star, value, xfer_cost, xfer_time, jnltime, days_old, coriolis 
                     from v_ship_list`;

  logStream.write('<!DOCTYPE html><html lang="en">\n');
  logStream.write('<head>\n');
  logStream.write('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"'
                + ' integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">\n');
  logStream.write('</head><body><div translate="no" class="notranslate">\n');

  logStream.write('<h4 class="p-1">CMDR Status</h4><p class="p-2">Shipyard transfer information relates to the last shipyard visited -<br>\n');

  dao.db.all(cmdrSql, [], (dberr, rows) => {
    if (dberr) {
      throw dberr;
    }
    rows.forEach((row) => {
      logStream.write(`CMDR ${row.cmdr} last visited ${row.star}/${row.station} shipyard  ${row.days_old} days ago<br>\n`);
    });
    logStream.write('</p><h4 class="p-1">List of Ships</h4>\n');
    logStream.write('<table class="table table-striped">\n');
    logStream.write('<tr><th>CMDR</th><th>Ship Type</th><th>Ship Name</th><th>System</th><th>Value</th>'
                  + '<th>Xfer Cost</th><th>Xfer Mins</th><th>Coriolis</th><th>Days Old</th><th>Date/Time</th></tr>\n');
  });


  dao.db.all(shipSql, [], (dberr, rows) => {
    if (dberr) {
      throw dberr;
    }
    rows.forEach((row) => {
      logStream.write('<tr>'
            + `<td>${row.cmdr}</td>`
            + `<td>${row.shiptype}</td>`
            + `<td>${row.shipname}</td>`
            + `<td>${row.star}</td>`
            + `<td>${parseInt(row.value, 10).toLocaleString()}</td>`
            + `<td>${parseInt(row.xfer_cost, 10).toLocaleString()}</td>`
            + `<td>${row.xfer_time}</td>`
            + `<td><a href='${row.coriolis}'>view ship</a></td>`
            + `<td>${row.days_old}</td>`
            + `<td>${row.jnltime}</td>`
            + '</tr>\n');
    });

    logStream.write('</table></div></body></html>\n');
    logStream.close();
  });
}

function writeStoredModules() {
  const logStream = fs.createWriteStream('./public/stmods.html', { flags: 'w' });

  const cmdrSql = `with mods as (
    select cmdr, StarSystem as location, count(*) as modules from v_stored_modules group by  cmdr, StarSystem union
    select cmdr, '~Total (all stored modules)' as location, count(*) as modules from v_stored_modules group by  cmdr
    )
    select cmdr, replace(location,'~','') as location, modules from mods;`;

  const moduleSql = `select cmdr,StarSystem,slot_type,item_group,Item,
                            "size","type",blueprint,"Level",Quality,BuyPrice,Hot
                       from v_stored_modules;`;

  logStream.write('<!DOCTYPE html><html lang="en">\n');
  logStream.write('<head>\n');
  logStream.write('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"'
                + ' integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">\n');
  logStream.write('</head><body><div translate="no" class="notranslate">\n');

  logStream.write('<h4 class="p-1">CMDR Stored Module Stats</h4><p>\n');

  let cmdr = 'none';

  dao.db.all(cmdrSql, [], (dberr, rows) => {
    if (dberr) {
      throw dberr;
    }
    rows.forEach((row) => {
      const cmdrHddr = `</p><h5 class="p-1">${row.cmdr}</h5><p>`;
      logStream.write(`${(row.cmdr !== cmdr) ? cmdrHddr : ''}&nbsp;CMDR ${row.cmdr} has ${row.modules} module${(row.modules > 1) ? 's' : ''} stored in ${row.location}<br>\n`);
      cmdr = row.cmdr;
    });
    logStream.write('</p><h4 class="p-1">List of Stored Modules</h4>\n');
    logStream.write('<table class="table table-striped">\n');
    logStream.write('<tr><th>CMDR</th><th>System</th><th>Slot Type</th><th>Item Group</th><th>Item</th><th>Size</th><th>Type</th>'
                  + '<th>Blueprint</th><th>Level</th><th>Quality</th><th>Buy Price</th><th>Hot</th></tr>\n');
  });

  dao.db.all(moduleSql, [], (dberr, rows) => {
    if (dberr) {
      throw dberr;
    }
    rows.forEach((row) => {
      logStream.write('<tr>'
              + `<td>${row.cmdr}</td>`
              + `<td>${row.StarSystem}</td>`
              + `<td>${row.slot_type}</td>`
              + `<td>${row.item_group}</td>`
              + `<td>${row.Item}</td>`
              + `<td>${row.size}</td>`
              + `<td>${row.type}</td>`
              + `<td>${row.blueprint}</td>`
              + `<td>${row.Level}</td>`
              + `<td>${row.Quality}</td>`
              + `<td>${row.BuyPrice}</td>`
              + `<td>${row.Hot}</td>`
              + '</tr>\n');
    });

    logStream.write('</table></div></body></html>\n');
    logStream.close();
  });
}
