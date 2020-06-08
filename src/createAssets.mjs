/* eslint-disable import/extensions */
/* eslint-disable no-console */
import { promises as fs } from 'fs';

import config from './config/config.mjs';
import release from './version.mjs';
import AppDAO from './db/dao.mjs';
import createShipyard from './htmlgen/shipyard.mjs';
import createStoredMods from './htmlgen/storedMods.mjs';

async function main() {
  const dao = await new AppDAO(config.db.path);
  await dao.init();
  console.log('Creating results');
  await createShipyard(dao);
  await createStoredMods(dao);
  // await writeShipyard();
  // await writeStoredModules();
}

main();
