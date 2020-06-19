/* eslint-disable import/extensions */
/* eslint-disable no-console */
import fs from 'fs';
import es from 'event-stream';

import release from '../version.mjs';
import writeHeader from './header.mjs';

// const cmdrSql = 'select * from v_cmdr_module_summary';

const fsdJumpSql = 'select * from v_fsdjump where days_old <= 5';

function pround(num, decimals) {
  const t = 10 ** decimals;
  return (Math.round((num * t) + (decimals > 0 ? 1 : 0) * (Math.sign(num)
          * (10 / (100 ** decimals)))) / t).toFixed(decimals);
}

async function createFsdJump(dao) {
  console.time('fsdjump.html written in');

  const modRows = await dao.all(fsdJumpSql, []);

  es.readable(async function foo(count, next) {
    await writeHeader(this, 'FSD Jump Analysis');
    await waitWrite(this, 'data', '</p><h4 class="p-1">Recent FSD Jump History</h4>\n');
    await waitWrite(this, 'data', '<table class="table table-striped">\n');
    await waitWrite(this, 'data', '<tr><th>Date</th><th>Time</th><th>System</th><th>Power</th>'
          + '<th>Power State</th><th>Faction</th><th>CF</th><th>Influence</th><th>State</th>'
          + '<th>Active States</th><th>Pending States</th><th>Happiness</th><th>Allegiance</th><th>My Rep</th></tr>\n');

    modRows.forEach(async (row) => {
      await waitWrite(this, 'data', '<tr>'
      // + `<td>${row.cmdr}</td>`
      + `<td>${row.jnldate}</td>`
      + `<td>${row.jnltime}</td>`
      + `<td>${row.system}</td>`
      + `<td>${row.power}</td>`
      + `<td>${row.pp_state}</td>`
      + `<td>${row.faction}</td>`
      + `<td>${row.cf}</td>`
      + `<td>${pround(row.influence, 3)}</td>`
      + `<td>${row.faction_state}</td>`
      + `<td>${row.active}</td>`
      + `<td>${row.pending}</td>`
      + `<td>${row.happiness}</td>`
      + `<td>${row.allegiance}</td>`
      + `<td>${pround(row.my_reputation, 1)}</td>`
      + '</tr>\n');
    });
    await waitWrite(this, 'data', `</table><h6 style="text-align:center">Version ${release}</h6></div></body></html>\n`);
    await waitWrite(this, 'end');
    next();
  }).pipe(fs.createWriteStream('./public/fsdjump.html'));

  console.timeEnd('fsdjump.html written in');
}

async function waitWrite(evStr, mode, line) {
  evStr.emit(mode, line);
}

export { createFsdJump as default };
