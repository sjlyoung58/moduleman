/* eslint-disable import/extensions */
/* eslint-disable no-console */
import fs from 'fs';
import es from 'event-stream';
import release from '../version.mjs';

const cmdrSql = 'SELECT distinct cmdr, jnltime FROM v_materials';

const shipSql = 'select cmdr, "type", name, qty from v_materials';

async function createMaterials(dao) {
  console.time('mats.html written in');

  const cmdrRows = await dao.all(cmdrSql, []);
  const shipRows = await dao.all(shipSql, []);

  es.readable(async function foo(count, next) {
    await writeHeader(this, 'CMDR Status');

    await cmdrRows.forEach(async (row) => {
      await waitWrite(this, 'data', `CMDR ${row.cmdr} materials as at ${row.jnltime}<br>\n`);
    });

    await waitWrite(this, 'data', '</p><h4 class="p-1">List of Materials</h4>\n');
    await waitWrite(this, 'data', '<table class="table table-striped">\n');
    await waitWrite(this, 'data', '<tr><th>CMDR</th><th>Type</th><th>Name</th><th>Qty</th></tr>\n');

    shipRows.forEach(async (row) => {
      await waitWrite(this, 'data', '<tr>'
                            + `<td>${row.cmdr}</td>`
                            + `<td>${row.type}</td>`
                            + `<td>${row.name}</td>`
                            + `<td>${row.qty}</td>`
                            + '</tr>\n');
    });

    await waitWrite(this, 'data', `</table><h6 style="text-align:center">Version ${release}</h6></div></body></html>\n`);

    await waitWrite(this, 'end');
    next();
  }).pipe(fs.createWriteStream('./public/mats.html'));

  console.timeEnd('mats.html written in');
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

export { createMaterials as default };
