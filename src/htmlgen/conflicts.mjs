/* eslint-disable import/extensions */
/* eslint-disable no-console */
import fs from 'fs';
import es from 'event-stream';

import release from '../version.mjs';
import writeHeader from './header.mjs';

const conflictSql = 'select * from v_conflicts where days_old <= 14';

async function createConflicts(dao) {
  console.time('conflicts.html written in');

  const conflictRows = await dao.all(conflictSql, []);
  // console.debug('Conflict rows', conflictRows);

  es.readable(async function foo(count, next) {
    await writeHeader(this, 'Conflicts in Recently Visited Systems');
    // await waitWrite(this, 'data', '</p>');
    await waitWrite(this, 'data', '<table class="table table-striped">\n');
    await waitWrite(this, 'data', '<tr><th>Date</th><th>System</th><th>Type</th>'
          + '<th>Status</th><th>Score</th><th>Faction 1</th><th>Faction 2</th><th>Won 1</th>'
          + '<th>At Stake 1</th><th>Won 2</th><th>At Stake 2</th></tr>\n');

    conflictRows.forEach(async (row) => {
      await waitWrite(this, 'data', '<tr>'
      // + `<td>${row.cmdr}</td>`
      + `<td>${row.jnldate}</td>`
      + `<td>${row.system}</td>`
      + `<td>${row.type}</td>`
      + `<td>${row.status}</td>`
      + `<td>${row.score}</td>`
      + `<td>${row.fac1}</td>`
      + `<td>${row.fac2}</td>`
      + `<td>${row.won1}</td>`
      + `<td>${row.at_stake1}</td>`
      + `<td>${row.won2}</td>`
      + `<td>${row.at_stake2}</td>`
      + '</tr>\n');
    });
    await waitWrite(this, 'data', `</table><h6 style="text-align:center">Version ${release}</h6></div></body></html>\n`);
    await waitWrite(this, 'end');
    next();
  }).pipe(fs.createWriteStream('./public/conflicts.html'));

  console.timeEnd('conflicts.html written in');
}

async function waitWrite(evStr, mode, line) {
  evStr.emit(mode, line);
}

export { createConflicts as default };
