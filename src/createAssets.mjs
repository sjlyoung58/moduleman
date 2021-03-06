/* eslint-disable import/extensions */
/* eslint-disable no-console */
// import { promises as fs } from 'fs';

import config from './config/config.mjs';
// import release from './version.mjs';
import AppDAO from './db/dao.mjs';
import createShipyard from './htmlgen/shipyard.mjs';
import createStoredMods from './htmlgen/storedMods.mjs';
import createShipMods from './htmlgen/shipMods.mjs';
import createMaterials from './htmlgen/materials.mjs';
import createFsdJump from './htmlgen/fsdJump.mjs';
import createConflicts from './htmlgen/conflicts.mjs';

async function main() {
  const dao = await new AppDAO(config.db.path);
  await dao.init();
  console.log('Creating results');
  await createShipyard(dao);
  await createStoredMods(dao);
  await createShipMods(dao);
  await createMaterials(dao);
  await createFsdJump(dao);
  await createConflicts(dao);
}

main();
