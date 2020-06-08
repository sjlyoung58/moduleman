/* eslint-disable no-console */
import fs from 'fs';
import es from 'event-stream';

const cmdrSql = `  SELECT cmdr, json_extract(jsondata,'$.StarSystem') as star, json_extract(jsondata,'$.StationName') as station,
round(julianday('now') - jnltime) as days_old FROM stg_st_ships`;

const shipSql = `select cmdr, shiptype, shipname, star, value, xfer_cost, xfer_time, jnltime, days_old, coriolis 
from v_ship_list`;

let cmdrRows;
let shipRows;

async function createShipyard(dao) {
  console.log('Starting...', dao);
  console.time('done in');

  cmdrRows = await dao.all(cmdrSql, []);
  // await dao.db.all(cmdrSql, [], async (dberr, rows) => {
  //   if (dberr) {
  //     throw dberr;
  //   }
  //   cmdrRows = rows;
  //   console.log('Retrieved cmdrRows');
  // });

  shipRows = await dao.all(shipSql, []);
  // await dao.db.all(shipSql, [], async (dberr, rows) => {
  //   if (dberr) {
  //     throw dberr;
  //   }
  //   shipRows = rows;
  //   console.log('Retrieved shipRows');
  // });


  es.readable(async function foo(count, next) {
    await writeHeader(this, 'CMDR Status');

    await cmdrRows.forEach(async (row) => {
      await waitWrite(this, 'data', `CMDR ${row.cmdr} last visited ${row.star}/${row.station} shipyard  ${row.days_old} days ago<br>\n`);
    });

    await waitWrite(this, 'data', 'after CMDR rows');

    await waitWrite(this, 'end');
    next();
  }).pipe(fs.createWriteStream('./public/test.html'));

  console.timeEnd('done in');
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
