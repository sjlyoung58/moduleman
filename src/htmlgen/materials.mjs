/* eslint-disable import/extensions */
/* eslint-disable no-console */
import fs from 'fs';
import es from 'event-stream';

import release from '../version.mjs';
import writeHeader from './header.mjs';

function getMatQty(material, matRows) {
  const matQty = matRows.filter((grp) => material === grp.name).map((ite) => ite.qty);
  return { name: material, qty: (matQty[0] || 0) };
}

function getCmdrMatTypeRow(label, matRows, materials) {
  // const group = matRows.filter((grp) => materials.includes(grp.name)).map((ite) => ite.qty);
  const group = materials.flatMap((mat) => getMatQty(mat, matRows));
  return JSON.stringify({ cat: label, materials: group });
}

function writeCmdrRawMats(cmdr, mats) {
  const oneval = mats.filter((raw) => raw.name === 'Arsenic').map((one) => one.qty);
  // console.debug('Raw', cmdr, mats);
  console.debug(cmdr, 'Arsenic=', oneval[0] || 0);
  console.debug(getCmdrMatTypeRow('Category 1', mats, ['Carbon', 'Vanadium', 'Niobium', 'Yttrium']));
  console.debug(getCmdrMatTypeRow('Category 2', mats, ['Phosphorus', 'Chromium', 'Molybdenum', 'Technetium']));
  console.debug(getCmdrMatTypeRow('Category 3', mats, ['Sulphur', 'Manganese', 'Cadmium', 'Ruthenium']));
  console.debug(getCmdrMatTypeRow('Category 4', mats, ['Iron', 'Zinc', 'Tin', 'Selenium']));
  console.debug(getCmdrMatTypeRow('Category 5', mats, ['Nickel', 'Germanium', 'Tungsten', 'Tellurium']));
  console.debug(getCmdrMatTypeRow('Category 6', mats, ['Rhenium', 'Arsenic', 'Mercury', 'Polonium']));
  console.debug(getCmdrMatTypeRow('Category 7', mats, ['Lead', 'Zirconium', 'Boron', 'Antimony']));
}

async function writeCmdrMfMats(cmdr, mats) {
  const oneval = mats.filter((raw) => raw.name === 'Modified Consumer Firmware').map((one) => one.qty);
  // console.debug('m/f ', cmdr, mats);
  console.debug(cmdr, 'Modified Consumer Firmware=', oneval[0] || 0);
}

async function writeCmdrEncMats(cmdr, mats) {
  const oneval = mats.filter((raw) => raw.name === 'Heat Vanes').map((one) => one.qty);
  // console.debug('Encoded ', cmdr, mats);
  console.debug(cmdr, 'Heat Vanes', oneval[0] || 0);
}


async function writeCmdrMaterials(cmdr, materials) {
  const raws = materials.filter((row) => row.type === 'Raw');
  const encs = materials.filter((row) => row.type === 'Encoded');
  const mnfs = materials.filter((row) => row.type === 'Manufactured');

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
      // await writeCmdrMaterials(row.cmdr, materialRows.filter((mat) => mat.cmdr === row.cmdr)
      //   .map((mat) => ({ type: mat.type, name: mat.name, qty: mat.qty })));
      await waitWrite(this, 'data', `<p>CMDR ${row.cmdr} materials as at ${row.jnltime}<br>\n`);
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
