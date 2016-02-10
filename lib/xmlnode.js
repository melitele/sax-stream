var Transform = require('stream').Transform;
var util = require('util');
var sax = require('sax');
var elem = require('./elem');
var debug = require('debug')('sax-stream');

module.exports = XmlNode;

function XmlNode(options) {
  if (!(this instanceof XmlNode)) {
    return new XmlNode(options);
  }

  Transform.call(this, {
    highWaterMark: 350,
    objectMode: true
  });
  this.records = [];
  this.error = null;
  this.parser = this.createSaxParser(options);
}

util.inherits(XmlNode, Transform);

XmlNode.prototype.createSaxParser = function (options) {

  var self = this,
  record,
  parser = sax.parser(true, {
    trim: false,
    normalize: false,
    xmlns: false,
    position: false
  });

  parser.onopentag = function(node) {
    debug('Open "%s"', node.name);
    if (record) {
      record = elem.addChild(record, node.name);
    }
    else if (node.name === options.tag) {
      record = {};
    }
    if (record && Object.keys(node.attributes).length) {
      record.attribs = node.attributes;
    }
  };

  parser.onclosetag = function(tag) {
    debug('Closed "%s"', tag);
    if (tag === options.tag && !record.parent) {
      debug('Emitting record', record);
      self.records.push(record);
      record = undefined;
    } else if (record) {
      record = record.parent;
    }
  };

  parser.ontext = function(value) {
    if (record) {
      elem.addText(record, value);
    }
  };

  parser.oncdata = function (value) {
    if (record) {
      elem.concatText(record, value);
    }
  };

  parser.onerror = function(err) {
    self.error = err;
  };

  parser.onend = function() {
    debug('onend - flushing remaining items');
    self.pushAll(self.callback);
    self.callback = null;
  };

  return parser;
};

XmlNode.prototype.pushAll = function (callback) {
  if (this.error) {
    callback(this.error);
    this.error = null;
    return;
  }
  debug('pushing %d', this.records.length);
  this.records.forEach(this.push.bind(this));
  this.records.length = 0;
  callback();
};

XmlNode.prototype._transform = function (chunk, encoding, callback) {
  this.parser.write(chunk.toString());
  this.pushAll(callback);
};

XmlNode.prototype._flush = function (callback) {
  var self = this;
  self.callback = callback;
  self.parser.close();
};
