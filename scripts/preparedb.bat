echo off

rem if user doesn't have their own local config yet, use the default template config
IF NOT EXIST "src\config\config.mjs" (
    echo creating default local configuration
    COPY "src\config\config.mjs.template" "src\config\config.mjs"
) ELSE (
    echo local configuration settings already present
)

rem initialise new database by deleting existing and creating schema
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
rem .\resources\sqlite3 .\db\journal.sqlite3 < .\resources\dbcheck.sql
