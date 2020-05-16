import fs from 'fs';
// import path from 'path';
// import datetime from 'node-datetime';
// import zlib from 'zlib';
// import URLSafeBase64 from 'urlsafe-base64';

// eslint-disable-next-line import/extensions
import config from './config/config.mjs';

const output = fs.readFileSync('testjournals/Cargo.json');

console.log(config.db.user);
console.log(output.toString());

fs.readdir('./testjournals/', function(err, files) {
    if (err) {
      console.log("Error getting directory information.")
    } else {
      files.forEach(function(file) {
        const nameParts = file.split('.');
        if (nameParts[0] == 'Journal') {
            console.log("its a journal")            
        } else {
            console.log("rejected")                        
        }
        processJournal(nameParts);
      })
    }
  })

function processJournal(nameParts) {
    console.log(nameParts);
}
