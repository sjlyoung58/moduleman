const config = {};

config.db = {};
config.jnl = {};

// config.jnl.path = './testjournals/';
config.jnl.path = `${process.env.USERPROFILE}/Saved Games/Frontier Developments/Elite Dangerous/`;

config.db.path = './db/journal.sqlite3';

export default config;
