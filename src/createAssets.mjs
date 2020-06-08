/* eslint-disable import/extensions */
/* eslint-disable no-console */
import { promises as fs } from 'fs';

import config from './config/config.mjs';
import release from './version.mjs';
import AppDAO from './db/dao.mjs';
import createShipyard from './htmlgen/shipyard.mjs';

let dao;

async function writeShipyard() {
  const filePath = './public/syard.html';

  const cmdrSql = `  SELECT cmdr, json_extract(jsondata,'$.StarSystem') as star, json_extract(jsondata,'$.StationName') as station,
                            round(julianday('now') - jnltime) as days_old FROM stg_st_ships`;

  const shipSql = `select cmdr, shiptype, shipname, star, value, xfer_cost, xfer_time, jnltime, days_old, coriolis 
                     from v_ship_list`;

  await writeHeader(filePath, 'CMDR Status');

  await dao.db.all(cmdrSql, [], async (dberr, rows) => {
    if (dberr) {
      throw dberr;
    }
    await rows.forEach(async (row) => {
      await fs.appendFile(filePath, `CMDR ${row.cmdr} last visited ${row.star}/${row.station} shipyard  ${row.days_old} days ago<br>\n`);
    });
  });


  await fs.appendFile(filePath, '</p><h4 class="p-1">List of Ships</h4>\n');
  await fs.appendFile(filePath, '<table class="table table-striped">\n');
  await fs.appendFile(filePath, '<tr><th>CMDR</th><th>Ship Type</th><th>Ship Name</th><th>System</th><th>Value</th>'
                  + '<th>Xfer Cost</th><th>Xfer Mins</th><th>Coriolis</th><th>Days Old</th><th>Date/Time</th></tr>\n');

  await dao.db.all(shipSql, [], async (dberr, rows) => {
    if (dberr) {
      throw dberr;
    }
    rows.forEach(async (row) => {
      await fs.appendFile(filePath, '<tr>'
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

    await fs.appendFile(filePath, `</table><h6 style="text-align:center">Version ${release}</h6></div></body></html>\n`);
  });
}


async function writeStoredModules() {
  const filePath = './public/stmods.html';

  const cmdrSql = 'select * from v_cmdr_module_summary';

  const moduleSql = `select cmdr,StarSystem,slot_type,item_group,Item,
                            "size","type",blueprint,"Level",Quality,BuyPrice,Hot
                       from v_stored_modules;`;

  await writeHeader('./public/stmods.html', 'CMDR Stored Module Stats');

  let cmdr = 'none';

  await dao.db.all(cmdrSql, [], async (dberr, rows) => {
    if (dberr) {
      throw dberr;
    }
    await rows.forEach(async (row) => {
      const cmdrHddr = `</p><h5 class="p-1">${row.cmdr}</h5><p>`;
      await fs.appendFile(filePath, `${(row.cmdr !== cmdr) ? cmdrHddr : ''}&nbsp;CMDR ${row.cmdr} has `
                    + `${row.modules} module${(row.modules > 1) ? 's' : ''} stored in ${row.location} ${row.engineer}<br>\n`);
      cmdr = row.cmdr;
    });

    await fs.appendFile(filePath, '</p><h4 class="p-1">List of Stored Modules</h4>\n');
    await fs.appendFile(filePath, '<table class="table table-striped">\n');
    await fs.appendFile(filePath, '<tr><th>CMDR</th><th>System</th><th>Slot Type</th><th>Item Group</th><th>Item</th><th>Size</th><th>Type</th>'
                  + '<th>Blueprint</th><th>Level</th><th>Quality</th><th>Buy Price</th><th>Hot</th></tr>\n');
  });

  await dao.db.all(moduleSql, [], async (dberr, rows) => {
    if (dberr) {
      throw dberr;
    }
    await rows.forEach(async (row) => {
      await fs.appendFile(filePath, '<tr>'
              + `<td>${row.cmdr}</td>`
              + `<td>${row.StarSystem}</td>`
              + `<td>${row.slot_type}</td>`
              + `<td>${row.item_group}</td>`
              + `<td>${row.Item}</td>`
              + `<td>${row.size}</td>`
              + `<td>${row.type}</td>`
              + `<td>${row.blueprint}</td>`
              + `<td>${row.Level}</td>`
              + `<td>${(row.Quality === 0) ? 'Legacy' : row.Quality}</td>`
              + `<td>${row.BuyPrice}</td>`
              + `<td>${row.Hot}</td>`
              + '</tr>\n');
    });

    await fs.appendFile(filePath, `</table><h6 style="text-align:center">Version ${release}</h6></div></body></html>\n`);
  });
}

async function writeHeader(filePath, mainTitle) {
  await fs.writeFile(filePath, '<!DOCTYPE html><html lang="en">\n', 'utf-8');
  await fs.appendFile(filePath, '<head>\n', 'utf-8');
  await fs.appendFile(filePath, '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"'
    + ' integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">\n'
    + '<link rel="shortcut icon" href="../images/favicon.ico">\n', 'utf-8');
  await fs.appendFile(filePath, '</head><body><div translate="no" class="notranslate">\n', 'utf-8');
  await fs.appendFile(filePath, `<h4 class="p-1">${mainTitle}</h4><p>\n`, 'utf-8');
}

async function main() {
  dao = await new AppDAO(config.db.path);
  await dao.init();
  console.log('Creating results');
  await createShipyard(dao);
  await writeShipyard();
  await writeStoredModules();
}

main();
