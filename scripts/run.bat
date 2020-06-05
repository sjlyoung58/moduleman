echo off
echo Analysing journals...
node --experimental-modules --no-warnings ./src/journalscan.mjs
echo ....done
echo finished processing journals
node --experimental-modules --no-warnings ./src/createAssets.mjs
echo finished creating output
start "ED Fleet Manager" .\public\index.html
