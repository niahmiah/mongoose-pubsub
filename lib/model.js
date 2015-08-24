'use strict';

var mongoose = require('mongoose');

var Message = new mongoose.Schema({
  channel: String,
  timestamp: {type: Date, default: Date.now},
  message: {}
}, {
  capped: {
    size: 1024 * 16 * 25, // in bytes
    autoIndexId: true
  }
});

module.exports = Message = mongoose.model('Message', Message);
