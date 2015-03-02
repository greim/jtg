/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * All Rights Reserved.
 */

var stream = require('stream')
  , util = require('util')
  , co = require('co')
  , _ = require('lodash')
  , iterationHelper = require('./writable-stream-iteration-helper')

// -----------------------------------------------------

function Writable(opts, genFn) {
  stream.Writable.call(this, opts);
  this._ponyIncomingValues = iterationHelper(this);
  var self = this;
  function input(enc) {
    var prom = self._ponyIncomingValues.next().value;
    if (enc) {
      return prom.then(byEncoding(enc));
    } else {
      return prom;
    }
  }
  co(genFn.bind(this, input))
  .catch(function(err) { self.emit('error', err); })
}

util.inherits(Writable, stream.Writable);

Writable.prototype._write = function(chunk, enc, callback) {
  this.emit('_ponyWriteCalled', chunk, enc, callback);
};

// -----------------------------------------------------

var byEncoding = _.memoize(function(enc){
  return function(thing){
    return thing.toString(enc);
  };
});

// -----------------------------------------------------

module.exports = Writable;
