const config = {};

config.db = {};
config.eddn = {};

// config.default_stuff =  ['red','green','blue','apple','yellow','orange','politics'];
// config.twitter.user_name = process.env.TWITTER_USER || 'username';
// config.twitter.password=  process.env.TWITTER_PASSWORD || 'password';

config.db.user = 'simonyoung';
config.db.host = '192.168.1.80';
config.db.database = 'simonyoung';
config.db.password = 'xxxx';
config.db.port = 5432;

config.eddn.uri = 'tcp://eddn.edcd.io:9500';

export default config;
