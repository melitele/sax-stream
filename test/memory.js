var Writable = require('stream').Writable;
var util = require('util');

module.exports = Memory;

function Memory (array) {
  if (!(this instanceof Memory)) {
    return new Memory(array);
  }

  Writable.call(this, { objectMode : true });
  this.array = array;
}

util.inherits(Memory, Writable);

Memory.prototype._write = function (item, encoding, callback) {
  this.array.push(item);
  callback();
};
