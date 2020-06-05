import * as util from 'util';
import * as stream from 'stream';
import * as fs from 'fs';
import {once} from 'events';

const finished = util.promisify(stream.finished); // (A)

async function writeIterableToFile(iterable, filePath) {
  const writable = fs.createWriteStream(filePath, {encoding: 'utf8'});
  for await (const chunk of iterable) {
    if (!writable.write(chunk)) { // (B)
      // Handle backpressure
      await once(writable, 'drain');
    }
  }
  writable.end(); // (C)
  // Wait until done. Throws if there are errors.
  await finished(writable);
}

export { writeIterableToFile as default};
// await writeIterableToFile(
//   ['One', ' line of text.\n'], 'tmp/log.txt');

// assert.equal(
//   fs.readFileSync('tmp/log.txt', {encoding: 'utf8'}),
//   'One line of text.\n');