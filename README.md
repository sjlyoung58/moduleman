# moduleman
This node js project analyses your Elite Dangerous journals
and produces handy references for all of your ships and modules
## Current status
Currently the following output is created
- list of your ships with links to coriolis.io website
- list of your stored modules ordered sensibly. Engineering blueprint name, level and quality are shown but not experimental effect (not in the journal)
- list of the modules on all of your ships ordered sensibly and with full engineering details
- list of Materials you have
- FSD Jump recent history (systems & faction states)
- details of all conflicts in recently visited systems

The system is designed to run by default on the same Windows PC you use to
run Elite Dangerous. If you want to run it on a different machine, you can edit the default config in src/config/config.mjs to point to a non-standard location for your journals (e.g. a drive mapped from another PC)

# Getting started

If you haven't already got node js v10 or above on your PC you will need to install it

Check if you have node js and what version - start a Command prompt and type

`node -v`

If node is already installed at version 10 or higher you can skip the next section
## Installing node js

**IMPORTANT** - do *not* install nvm to a path containing spaces, it won't work

First, follow this Microsoft guide to
[install Node Version Manager](https://docs.microsoft.com/en-us/windows/nodejs/setup-on-windows) (nvm) on Windows

Once nvm is installed successfully, use nvm in a command prompt to install node js version 12.6.3 and set this as the preferred version to use

`nvm install 12.16.3`

`nvm use 12.16.3`

## Install Git for Windows (if you don't already have it)

Download git here https://gitforwindows.org/ and install it with all the default settings

## Clone this project to your PC

Create a folder to contain this and any other git projects, or choose an existing suitable one

Open a command prompt and 
```
cd <folder>
git clone https://github.com/sjlyoung58/moduleman.git
```
This will create `<folder>\moduleman` containing all the project code 

## Running the code
### First time only (or whenever a new version is downloaded)
Start a command prompt in the root of the extracted project and type the following -

`npm install`

This will pull down all of the node js packages required by this project

Next run this from the root of the project (i.e. do not `cd scripts` first) -

`.\scripts\preparedb.bat`

This should initialise a Sqlite database in the `./db/` folder

### Every time you wish to analyse your journals for new content
By default, the code will look for journals in the standard location for Elite. If this is not where you have your journals, edit `.\src\config\config.mjs` to set the correct location for your journals

Start a command prompt in the root of the extracted project (i.e. do not `cd scripts` first) and type the following -

`.\scripts\run.bat`

This will analyse your journals and create web pages of all your ships, modules etc. You can use File... Open... to open
`.\public\index.html` in your browser (or any of the other pages created  in `.\public\`)

`.\scripts\run.bat` will also open `.\public\index.html` in your default browser automatically

You can refresh your output file every time your journals change by rerunning `.\scripts\run.bat`

As well as the HTML output described above, the system can produce various extracts that you can load into Google Sheets, Excel (or any other suitable program) so you can make your own analysis of the data taken from your journal. To do this you will need to run a Linux bash script which you can do using Git Bash that was installed alongside Git. To do this, right click on your 'moduleman' project folder in Windows Explorer and choose 'Git Bash Here', this will open a Git Bash prompt, in this prompt run the following

```./scripts/extrun.sh```

This will run the journal analysis code and then also produce various extracts in `moduleman\public\extracts`

### Exploring the Sqlite Database

If you know SQL and wish to explore the database created by this project, I recommend using DBeaver (community edition) which can be downloaded for free from https://dbeaver.io/ or can be installed from the Windows Store