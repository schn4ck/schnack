const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const config = require('../config');
const conf = config.get('database');

// returns promise that passes db obj
function init() {
    const dbname = conf.comments || conf;
    const dbpath = path.resolve(process.cwd(), dbname);

    return Promise.resolve(open({ filename: dbpath, driver: sqlite3.Database }))
        .then(db =>
            db.migrate({
                migrationsPath: path.resolve(__dirname, '../../migrations'),
                // force: process.env.NODE_ENV === 'development' ? 'last' : false
                force: false
            })
        )
        .catch(err => console.error(err));
}

module.exports = {
    init
};
