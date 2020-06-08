/* eslint-disable no-console */
import fs from 'fs';
import es from 'event-stream';

console.log('Starting...');

console.time('done in');

es.readable( function foo(count, next) {
  for (let i = 0; i < 100; i++) {
    this.emit('data', `line ${i}\n`);
  }
  for (let i = 200; i < 300; i++) {
    this.emit('data', `line ${i}\n`);
  }
  this.emit('end');
  console.timeEnd('done in');
  next();
}).pipe(fs.createWriteStream('./public/out.txt'));
