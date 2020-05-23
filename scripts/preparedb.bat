echo off
IF EXIST db\journal.sqlite3 (
    echo clearing existing database
    del db\journal.sqlite3 
    if exist "db\journal.sqlite3" (
        echo - do you have the database open in another program? Please check and retry
        exit /b
        ) else (
        1> nul ver)
) ELSE (
    echo db\journal.sqlite3 not present - first run assumed
)

echo creating new database
.\resources\sqlite3 .\db\journal.sqlite3 < .\resources\createschema.sql
.\resources\sqlite3 .\db\journal.sqlite3 < .\resources\dbcheck.sql
