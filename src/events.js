const EventEmitter = require('events');

class SchnackEventEmitter extends EventEmitter {}

module.exports = new SchnackEventEmitter();
