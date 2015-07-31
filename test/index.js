'use strict';
var mongoose = require('mongoose');
var messenger = require('../index');
var should = require('chai').should();
var Message = require('../lib/model');

describe('Mongoose Messenger', function(){
  before(function(done){
    var options = {
      server: {
        socketOptions: {keepAlive: 1}
      }
    }
    mongoose.connect('mongodb://localhost/test', options);
    var db = mongoose.connection;
    db.on('error', done);
    db.once('open', function(){
      messenger.connect(done);
    });
  });

  it('should allow me to create a message', function(done){
    var msg = Math.random();
    messenger.send('event', msg, function(err){
      should.not.exist(err);
      Message.findOne({message: msg}, function(err, doc){
        should.exist(doc);
        done();
      });
    });
  });

  it('should emit events for subscribed channels', function(done){
    var msg = 1 + Math.random();
    messenger.subscribe('event' + msg, true);
    messenger.on('event' + msg, function(doc){
      done();
    });
    messenger.send('event' + msg, {test: 'message1'}, function(){
    });
  });

  it('should should not emit events for unsubscribed channels', function(done){
    var msg = 2 + Math.random();
    var failed;
    function fail(){
      failed = new Error('failed');
    }
    messenger.on('event' + msg, function(doc){
      fail();
    });
    messenger.send('event' + msg, {test: 'message2'});

    setTimeout(function(){
      done(failed);
    }, 1000);
  });
});
