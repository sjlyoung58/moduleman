/* eslint-disable no-console */

import { promises as fsp } from 'fs';

async function myWrite() {
  try {
    await fsp.writeFile('../public/test6.js', "console.log('Hello world with Node.js v13 fs.promises!'");
    console.info('File created successfully with Node.js v13 fs.promises!');
  } catch (error) {
    console.error(error);
  }
}
