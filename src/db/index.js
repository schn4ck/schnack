const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbname = 'comments.db';
const dbpath = path.resolve(__dirname, `../../${dbname}`);
const schemapath = path.resolve(__dirname, `./schema.sql`);

function connect() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbpath, (err) => {
      if (err) return reject(err);
      console.log('connected to db.');
      resolve(db);
    });
  });
}

function createSchema(db) {
  return new Promise((resolve, reject) => {
    db.all("SELECT name FROM sqlite_master WHERE type = 'table'", (err, rows) => {
      if (err) return resolve(err);
      if (!rows.length) return db.exec(fs.readFileSync(schemapath, 'utf-8'), () => resolve(db));

      resolve(db);
    });
  });
}

// returns promise that passes db obj
function init() {
  return connect().then(db => createSchema(db));
}

module.exports = {
  init
};

