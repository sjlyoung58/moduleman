/* eslint-disable import/extensions */
/* eslint-disable no-console */
import fs from 'fs';

import config from './config/config.mjs';
import AppDAO from './db/dao.mjs';

const dao = new AppDAO(config.db.path);


writeLinks();

function writeLinks() {
  const logStream = fs.createWriteStream('./public/links.html', { flags: 'w' });
  logStream.write('<!DOCTYPE html><html lang="en">\n');
  logStream.write('<head>\n');
  logStream.write('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">\n');
  logStream.write('</head>\n');
  logStream.write('<body><div><table class="table table-striped">\n');
  logStream.write('<tr><th>CMDR</th><th>Ship Type</th><th>Ship Name</th><th>Coriolis</th><th>Days Old</th><th>Date/Time</th></tr>\n');
  dao.db.all(`select cmdr, shiptype, shipname, jnltime, days_old, coriolis 
               from v_loadout`, [], (dberr, rows) => {
    if (dberr) {
      throw dberr;
    }
    rows.forEach((row) => {
      logStream.write('<tr>'
            + `<td>${row.cmdr}</td>`
            + `<td>${row.shiptype}</td>`
            + `<td>${row.shipname}</td>`
            + `<td><a href='${row.coriolis}'>view ship</a></td>`
            + `<td>${row.days_old}</td>`
            + `<td>${row.jnltime}</td>`
            + '</tr>\n');
    });
    logStream.write('</table></div></body></html>\n');
    logStream.close();
  });
}
