const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const config = require('../config');
const conf = config.get('database');

// returns promise that passes db obj
module.exports = {
    async init() {
        const dbname = conf.comments || conf;
        const dbpath = path.resolve(process.cwd(), dbname);

        try {
            const db = await open({ filename: dbpath, driver: sqlite3.Database });
            await db.migrate({
                migrationsPath: path.resolve(__dirname, '../../migrations'),
                // force: process.env.NODE_ENV === 'development' ? 'last' : false
                force: false
            });
            return db;
        } catch (err) {
            console.error(err);
        }
    }
};
