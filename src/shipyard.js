// requiring path and fs modules
const path = require('path');
const fs = require('fs');
const datetime = require('node-datetime');
const zlib = require('zlib');
const URLSafeBase64 = require('urlsafe-base64');

const ships = new Map();

console.log('Starting...');

// joining path of directory
// const directoryPath = path.join(__dirname, '/Users/simonyoung/Projects/EDJournal/jnlmock/testjournals/EDMC_Shipyard');
const dirPath = '/Users/simonyoung/Projects/EDJournal/jnlmock/testjournals/EDMC_Shipyard';
// passsing directoryPath and callback function
fs.readdir(dirPath, (err, files) => {
  // handling error
  if (err) {
    return console.log(`Unable to scan directory: ${err}`);
  }

  files.forEach((file) => {
    const nameParts = file.split('.');

    if (nameParts.length === 5) {
      const ship = nameParts[0];
      const ts = datetime.create(`${nameParts[1]}:${nameParts[2]}:${nameParts[3]}`);
      let currShip = ships.get(ship);
      if (currShip === undefined) {
        // first file for this ship
        currShip = [file, ts];
        ships.set(ship, currShip);
      }
      const newer = (ts.getTime() > currShip[1].getTime());
      // console.log(ship +' new =' + ts.format('Y/m/d H:M') +
      //             ',old =' + currShip[1].format('Y/m/d H:M') + ', newer = ' +
      //             newer + ' ts value ' + ts.valueOf());
      if (newer) {
        // console.log('replacing ' + ts.format('Y/m/d H:M'));
        currShip = [file, ts];
      }
      ships.set(ship, currShip);
    }
  });

  // now iterate the map of ships and add the json loadout & url encoded gzip of this
  for (const [k, v] of ships) {
    // const contents = fs.readFileSync(path.join(dirPath,v[0]));
    const contents = fs.readFileSync(`${dirPath}/${v[0]}`);
    const loadout = jsonContent = JSON.parse(contents);
    v.push(JSON.stringify(loadout));
    const buf = new Buffer.from(v[2], 'utf-8');
    v.push(URLSafeBase64.encode(zlib.gzipSync(buf)));
    console.log(k,
      // + '\nhttps://coriolis.io/import?data=' + v[3]
    );
  }

  // iterate the map again to write html links. Could do above, but this
  // allows us to sort, access the JSON loadout as required
  /*
 <table style="width:100%">
  <tr>
    <th>Firstname</th>
    <th>Lastname</th>
    <th>Age</th>
  </tr>
  <tr>
    <td>Jill</td>
    <td>Smith</td>
    <td>50</td>
  </tr>
</table>
    */
  const logStream = fs.createWriteStream('./output/links.html', { flags: 'w' });
  logStream.write('<!DOCTYPE html><html><body><div><table style="width:100%">\n');
  const today = datetime.create();

  for (const [k, v] of ships) {
    const loadout = jsonContent = JSON.parse(v[2]);
    const daysDiff = parseInt((today.getTime() - v[1].getTime()) / (1000 * 3600 * 24));
    if (loadout.Ship === undefined) {
      console.log(`Ship JSON invalid (probably old): ${v[0]}`);
    } else {
      logStream.write(`<tr><td><a href='https://coriolis.io/import?data=${
        v[3]}'>${k}</a>`
            + `<td>${loadout.Ship}</td>`
            + `<td>${loadout.ShipID}</td>`
            + `<td>${daysDiff}</td>`
            + `<td>${v[1].format('Y/m/d H:M')}</td>`
            + '</tr>\n');
    }
  }
  logStream.end('</table></div></body></html>\n');

  console.log('...finished');
});
