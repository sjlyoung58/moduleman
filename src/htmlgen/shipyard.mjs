/* eslint-disable no-console */
import fs from 'fs';
import es from 'event-stream';

async function createShipyard(dao) {
  console.log('Starting...', dao);
  console.time('done in');
  es.readable(function foo(count, next) {
    writeHeader(this,'The Title');
    for (let i = 0; i < 100; i++) {
      this.emit('data', `line ${i}\n`);
    }
    for (let i = 200; i < 300; i++) {
      this.emit('data', `line ${i}\n`);
    }
    this.emit('end');
    console.timeEnd('done in');
    next();
  }).pipe(fs.createWriteStream('./public/test.html'));
}

async function writeHeader(evStr, mainTitle) {
  evStr.emit('data', '<!DOCTYPE html><html lang="en">\n');
  evStr.emit('data',  '<head>\n', 'utf-8');
  evStr.emit('data',  '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"'
    + ' integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">\n'
    + '<link rel="shortcut icon" href="../images/favicon.ico">\n');
  evStr.emit('data', '</head><body><div translate="no" class="notranslate">\n');
  evStr.emit('data', `<h4 class="p-1">${mainTitle}</h4><p>\n`);
}

export { createShipyard as default };
