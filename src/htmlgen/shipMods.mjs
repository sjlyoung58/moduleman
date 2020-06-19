/* eslint-disable import/extensions */
/* eslint-disable no-console */
import fs from 'fs';
import es from 'event-stream';

import release from '../version.mjs';
import writeHeader from './header.mjs';

// const cmdrSql = 'select * from v_cmdr_module_summary';

const moduleSql = ` select cmdr, ship_id, shiptype, shipname, star, 
slot_type, slot, item_group, item, "size", "type", 
ifnull(engineer,'') as engineer, 
ifnull(blueprint,'') as blueprint, 
ifnull(exp_effect,'') as exp_effect, 
ifnull("level",'') as "level", ifnull(quality,'') as quality,
ifnull(mods,'') as mods, mod_count
from v_ship_modules 
`;

async function createShipMods(dao) {
  console.time('shipmods.html written in');

  const modRows = await dao.all(moduleSql, []);

  es.readable(async function foo(count, next) {
    await writeHeader(this, 'CMDR Ship Modules');
    await waitWrite(this, 'data', '</p><h4 class="p-1">List of Modules on Ships</h4>\n');
    await waitWrite(this, 'data', '<table class="table table-striped">\n');
    await waitWrite(this, 'data', '<tr><th>CMDR</th><th>Ship Type</th><th>Ship Name</th><th>System</th><th>Slot Type</th><th>Slot</th><th>Item Group</th><th>Item</th><th>Size</th><th>Type</th>'
          + '<th>Blueprint</th><th>Exp Effect</th><th>Level</th><th>Quality</th><th>Modifications</th></tr>\n');

    modRows.forEach(async (row) => {
      await waitWrite(this, 'data', '<tr>'
      + `<td>${row.cmdr}</td>`
      + `<td>${row.shiptype}</td>`
      + `<td>${row.shipname}</td>`
      + `<td>${row.star}</td>`
      + `<td>${row.slot_type}</td>`
      + `<td>${row.slot}</td>`
      + `<td>${row.item_group}</td>`
      + `<td>${row.item}</td>`
      + `<td>${row.size}</td>`
      + `<td>${row.type}</td>`
      + `<td>${row.blueprint}</td>`
      + `<td>${row.exp_effect}</td>`
      + `<td>${row.level}</td>`
      + `<td>${(row.quality === 0) ? 'Legacy' : row.quality}</td>`
      + `<td>${row.mods}</td>`
      + '</tr>\n');
    });
    await waitWrite(this, 'data', `</table><h6 style="text-align:center">Version ${release}</h6></div></body></html>\n`);
    await waitWrite(this, 'end');
    next();
  }).pipe(fs.createWriteStream('./public/shipmods.html'));

  console.timeEnd('shipmods.html written in');
}

async function waitWrite(evStr, mode, line) {
  evStr.emit(mode, line);
}

export { createShipMods as default };
