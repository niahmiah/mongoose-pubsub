'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Message = require('./model');

function Messenger(){
  EventEmitter.apply(this, arguments);
  this.subscribed = {};
  this.lastObjectId = null;
}

util.inherits(Messenger, EventEmitter);

Messenger.prototype.send = function send(channel, msg, callback){
  var message = new Message({
    channel: channel,
    message: msg
  });
  message.save(callback);
};

Messenger.prototype.connect = function connect(callback){
  var self = this;
  var query = {};
  if(self.lastObjectId){
    query = {_id: {$gt: self.lastObjectId}};
  }
  var stream = Message.find(query).setOptions({ tailable: true, tailableRetryInterval: 10 }).stream();

  stream.on('data', function data(doc){
    self.lastObjectId = doc._id;
    if(self.subscribed[doc.channel]){
      self.emit(doc.channel, doc.message);
    }
  });

  // reconnect on error
  stream.on('error', function error(err){
    if(err.message !== 'No more documents in tailed cursor') {
      setTimeout(function timeout(){
        self.connect();
      }, 100);
    }
  });

  if(callback) callback();
};

Messenger.prototype.subscribe = function subscribe(channel, bool){
  var self = this;
  if(channel && bool){
    self.subscribed[channel] = bool;
    return;
  }
  if(channel && self.subscribed[channel]){
    delete self.subscribed[channel];
  }
};

module.exports = new Messenger();