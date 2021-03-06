/* eslint-disable import/extensions */
/* eslint-disable no-console */
import fs from 'fs';
import es from 'event-stream';

import release from '../version.mjs';
import writeHeader from './header.mjs';

const cmdrSql = 'select * from v_cmdr_module_summary';

const moduleSql = `select cmdr,StarSystem,slot_type,item_group,Item,
"size","type",blueprint,"Level",Quality,BuyPrice,Hot
from v_stored_modules;`;

async function createStoredMods(dao) {
  console.time('stmods.html written in');

  const cmdrRows = await dao.all(cmdrSql, []);
  const modRows = await dao.all(moduleSql, []);

  es.readable(async function foo(count, next) {
    await writeHeader(this, 'CMDR Stored Module Stats');

    let cmdr = 'none';
    cmdrRows.forEach(async (row) => {
      // console.log('Curr=', cmdr, ', this=', row.cmdr);
      const cmdrHddr = `<h5 class="p-1">${row.cmdr}</h5><p>`;
      waitWrite(this, 'data', `${(row.cmdr !== cmdr) ? cmdrHddr : '<p>'}&nbsp;CMDR ${row.cmdr} has `
                    + `${row.modules} module${(row.modules > 1) ? 's' : ''} stored in ${row.location} ${row.engineer}<br>\n`);
      cmdr = row.cmdr;
    });

    await waitWrite(this, 'data', '</p><h4 class="p-1">List of Stored Modules</h4>\n');
    await waitWrite(this, 'data', '<table class="table table-striped">\n');
    await waitWrite(this, 'data', '<tr><th>CMDR</th><th>System</th><th>Slot Type</th><th>Item Group</th><th>Item</th><th>Size</th><th>Type</th>'
          + '<th>Blueprint</th><th>Level</th><th>Quality</th><th>Buy Price</th><th>Hot</th></tr>\n');

    modRows.forEach(async (row) => {
      await waitWrite(this, 'data', '<tr>'
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
    await waitWrite(this, 'data', `</table><h6 style="text-align:center">Version ${release}</h6></div></body></html>\n`);
    await waitWrite(this, 'end');
    next();
  }).pipe(fs.createWriteStream('./public/stmods.html'));

  console.timeEnd('stmods.html written in');
}

async function waitWrite(evStr, mode, line) {
  evStr.emit(mode, line);
}

export { createStoredMods as default };
