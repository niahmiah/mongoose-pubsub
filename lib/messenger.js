'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Message = require('./model');

function Messenger(options){
  EventEmitter.apply(this, arguments);
  var o = options || {};
  this.subscribed = {};
  this.lastMessageTimestamp = null;
  this.startingMessageTimestamp = new Date();
  this.retryInterval = o.retryInterval || 100;
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
  var query = {timestamp: {$gte: self.startingMessageTimestamp}};
  if(self.lastMessageTimestamp){
    query = {timestamp: {$gt: self.lastMessageTimestamp}};
  }
  var stream = Message.find(query).setOptions({ tailable: true, tailableRetryInterval: self.retryInterval, numberOfRetries: Number.MAX_VALUE }).stream();

  stream.on('data', function data(doc){
    self.lastMessageTimestamp = doc.timestamp;
    if(self.subscribed[doc.channel]){
      self.emit(doc.channel, doc.message);
    }
  });

  // reconnect on error
  stream.on('error', function streamError(){
    stream.destroy();
    self.connect();
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

module.exports = Messenger;
