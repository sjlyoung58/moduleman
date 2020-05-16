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
