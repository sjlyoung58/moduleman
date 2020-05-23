echo off
echo Analysing journals...
node --experimental-modules ./src/journalscan.mjs
echo finished processing journalscan
node --experimental-modules ./src/createAssets.mjs
echo finished creating output
