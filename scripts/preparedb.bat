echo off
IF EXIST db\journal.sqlite3 (
    echo clearing existing database
    del db\journal.sqlite3
) ELSE (
    echo db\journal.sqlite3 not present - first run assumed
)

echo creating new database
.\resources\sqlite3 .\db\journal.sqlite3 < .\resources\createschema.sql
.\resources\sqlite3 .\db\journal.sqlite3 < .\resources\dbcheck.sql
