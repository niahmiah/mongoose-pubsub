# Mongoose Pub/Sub

This node module uses the "tailable cursor" feature of MongoDB capped collections to implement pub/sub messaging.



### Examples

```
npm install mongoose-pubsub
```

```
var pubsub = require('mongoose-pubsub');

//channel names are used as filters
var channelName = 'news';
pubsub.subscribe(channelName, true); //subscribe
pubsub.subscribe(channelName, false); //unsubscribe

// connect() begins "tailing" the collection
pubsub.connect(function(){
  //pubsub emits events for each new message on the channel
  pubsub.on(channelName, function(message){
    console.log(channelName, message);
  });
});

// you can send without connect() first.
pubsub.send(channelName, {some: 'message'}, function(err){
  console.log('Sent message');
});
```

See the test directory for more information

### Tests

```
npm test
npm run lint
npm run converage
```
