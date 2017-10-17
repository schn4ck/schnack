const fs = require('fs');
const path = require('path');
const db = require('sqlite');
const dbname = 'comments.db';
const dbpath = path.resolve(__dirname, `../../${dbname}`);

// returns promise that passes db obj
function init() {
  return Promise.resolve(db.open(dbpath, { Promise }))
  .then(db => db.migrate({
    force: process.env.NODE_ENV === 'development' ? 'last' : false
  }))
  .then(db => db.driver) // @FIXME
  .catch(err => console.error(err));
}

module.exports = {
  init
};

