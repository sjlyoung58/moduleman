/* eslint-disable import/extensions */
/* eslint-disable no-console */
import fs from 'fs';
import es from 'event-stream';

import release from '../version.mjs';
import writeHeader from './header.mjs';

async function getCmdrMatTypeRow(label, matRows, materials) {
  return 'Hello';
}

async function writeCmdrRawMats(cmdr, mats) {
  const oneval = mats.filter((raw) => raw.name === 'Arsenic').map((one) => one.qty);
  // console.debug('Raw', cmdr, mats);
  console.debug(cmdr, 'Arsenic=', oneval[0] || 0);
  console.debug(getCmdrMatTypeRow('Group 1',mats,['Carbon','Sulphur','Arsenic','Selenium']));
}

async function writeCmdrMfMats(cmdr, mats) {
  const oneval = mats.filter((raw) => raw.name === 'Modified Consumer Firmware').map((one) => one.qty); 
  // console.debug('m/f ', cmdr, mats);
  console.debug(cmdr, 'Mod C F=', oneval[0] || 0);
}

async function writeCmdrEncMats(cmdr, mats) {
  const oneval = mats.filter((raw) => raw.name === 'Heat Vanes').map((one) => one.qty); 
  // console.debug('Encoded ', cmdr, mats);
  console.debug(cmdr, 'Heat Vanes', oneval[0] || 0);
}


async function writeCmdrMaterials(cmdr, materials) {
  const raws = materials.filter((row) => row.type === 'Raw' );
  const encs = materials.filter((row) => row.type === 'Encoded' );
  const mnfs = materials.filter((row) => row.type === 'Manufactured' );

  await writeCmdrRawMats(cmdr, raws);
  await writeCmdrMfMats(cmdr, encs);
  await writeCmdrEncMats(cmdr, mnfs);
}

async function createMaterials(dao) {
  const cmdrSql = 'SELECT distinct cmdr, jnltime FROM v_materials';
  const materialSql = 'select cmdr, "type", name, qty from v_materials';
  
  console.time('mats.html written in');

  const cmdrRows = await dao.all(cmdrSql, []);
  const materialRows = await dao.all(materialSql, []);

  es.readable(async function foo(count, next) {
    await writeHeader(this, 'CMDR Status');

    await cmdrRows.forEach(async (row) => {
      await writeCmdrMaterials(row.cmdr,materialRows.filter((mat) => mat.cmdr === row.cmdr)
                         .map((mat) => ({ type: mat.type, name: mat.name, qty: mat.qty })));
      await waitWrite(this, 'data', `CMDR ${row.cmdr} materials as at ${row.jnltime}<br>\n`);
    });

    await waitWrite(this, 'data', '</p><h4 class="p-1">List of Materials</h4>\n');
    await waitWrite(this, 'data', '<table class="table table-striped">\n');
    await waitWrite(this, 'data', '<tr><th>CMDR</th><th>Type</th><th>Name</th><th>Qty</th></tr>\n');

    materialRows.forEach(async (row) => {
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

export { createMaterials as default };
