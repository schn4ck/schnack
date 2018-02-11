const fs = require('fs');
const path = require('path');
const db = require('sqlite');
const config = require(path.resolve(process.cwd(), 'config.json'));
const dbname = (typeof config.database == 'string' ? config.database : config.database.comments) || 'comments.db';
const dbpath = path.resolve(process.cwd(), dbname);

// returns promise that passes db obj
function init() {
  return Promise.resolve(db.open(dbpath, { Promise }))
  .then(db => db.migrate({
    // force: process.env.NODE_ENV === 'development' ? 'last' : false
    migrationsPath: path.resolve(__dirname, '..', '..', 'migrations'),
    force: false
  }))
  .then(db => db.driver) // @FIXME
  .catch(err => console.error(err));
}

module.exports = {
  init
};

