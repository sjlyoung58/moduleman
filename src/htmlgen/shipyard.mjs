/* eslint-disable import/extensions */
/* eslint-disable no-console */
import fs from 'fs';
import es from 'event-stream';
import release from '../version.mjs';

const cmdrSql = `  SELECT cmdr, json_extract(jsondata,'$.StarSystem') as star, json_extract(jsondata,'$.StationName') as station,
round(julianday('now') - jnltime) as days_old FROM stg_st_ships`;

const shipSql = `select cmdr, shiptype, shipname, star, value, xfer_cost, xfer_time, jnltime, days_old, coriolis 
from v_ship_list`;

async function createShipyard(dao) {
  console.time('syard.html written in');

  const cmdrRows = await dao.all(cmdrSql, []);
  const shipRows = await dao.all(shipSql, []);

  es.readable(async function foo(count, next) {
    await writeHeader(this, 'CMDR Status');

    await cmdrRows.forEach(async (row) => {
      await waitWrite(this, 'data', `CMDR ${row.cmdr} last visited ${row.star}/${row.station} shipyard  ${row.days_old} days ago<br>\n`);
    });

    await waitWrite(this, 'data', '</p><h4 class="p-1">List of Ships</h4>\n');
    await waitWrite(this, 'data', '<table class="table table-striped">\n');
    await waitWrite(this, 'data', '<tr><th>CMDR</th><th>Ship Type</th><th>Ship Name</th><th>System</th><th>Value</th>'
                    + '<th>Xfer Cost</th><th>Xfer Mins</th><th>Coriolis</th><th>Days Old</th><th>Date/Time</th></tr>\n');

    shipRows.forEach(async (row) => {
      await waitWrite(this, 'data', '<tr>'
                            + `<td>${row.cmdr}</td>`
                            + `<td>${row.shiptype}</td>`
                            + `<td>${row.shipname}</td>`
                            + `<td>${row.star}</td>`
                            + `<td>${parseInt(row.value, 10).toLocaleString()}</td>`
                            + `<td>${parseInt(row.xfer_cost, 10).toLocaleString()}</td>`
                            + `<td>${row.xfer_time}</td>`
                            + `<td><a href="${row.coriolis}" target="_blank"'>view ship</a></td>`
                            + `<td>${row.days_old}</td>`
                            + `<td>${row.jnltime}</td>`
                            + '</tr>\n');
    });

    await waitWrite(this, 'data', `</table><h6 style="text-align:center">Version ${release}</h6></div></body></html>\n`);

    // await waitWrite(this, 'data', 'after CMDR rows');

    await waitWrite(this, 'end');
    next();
  }).pipe(fs.createWriteStream('./public/syard.html'));

  console.timeEnd('syard.html written in');
}

async function waitWrite(evStr, mode, line) {
  evStr.emit(mode, line);
}

async function writeHeader(evStr, mainTitle) {
  evStr.emit('data', '<!DOCTYPE html><html lang="en">\n');
  evStr.emit('data', '<head>\n', 'utf-8');
  evStr.emit('data', '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"'
    + ' integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">\n'
    + '<link rel="shortcut icon" href="../images/favicon.ico">\n');
  evStr.emit('data', '</head><body><div translate="no" class="notranslate">\n');
  evStr.emit('data', `<h4 class="p-1">${mainTitle}</h4><p>\n`);
}

export { createShipyard as default };
