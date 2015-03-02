/*
 * Copyright (c) 2015 by Greg Reimer <gregreimer@gmail.com>
 * All Rights Reserved.
 */

var stream = require('stream')
  , util = require('util')
  , co = require('co')
  , _ = require('lodash')
  , unresolved = require('./unresolved')
  , iterationHelper = require('./writable-stream-iteration-helper')

// -----------------------------------------------------

function Transform(opts, genFn) {
  stream.Transform.call(this, opts);
  this._ponyIncomingValues = iterationHelper(this);
  this._ponySending = unresolved();
  var self = this;
  function input(enc) {
    var prom = self._ponyIncomingValues.next().value;
    if (enc) {
      return prom.then(byEncoding(enc));
    } else {
      return prom;
    }
  }
  input.ended = function(){
    return !!this._ponyEnded;
  };
  function output(data, enc) {
    return self._ponySending.then(function() {
      if (!self.push(data, enc)) {
        self._ponySending = unresolved();
      }
    });
  }
  co(genFn.bind(this, input, output))
  .then(function() { self.push(null); })
  .catch(function(err) { self.emit('error', err); })
}

util.inherits(Transform, stream.Transform);

Transform.prototype._transform = function(chunk, enc, callback) {
  this.emit('_ponyWriteCalled', chunk, enc, callback);
  this._ponySending.resolve();
};

Transform.prototype._flush = function(callback) {
  this._ponyEnded = true;
  callback();
};

// -----------------------------------------------------

var byEncoding = _.memoize(function(enc){
  return function(thing){
    return thing.toString(enc);
  };
});

// -----------------------------------------------------

module.exports = Transform;
