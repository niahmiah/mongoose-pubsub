# Mongoose Pub/Sub

This node module uses the "tailable cursor" feature of MongoDB capped collections to implement a pub/sub messaging.



### Examples

```
npm install mongoose-pubsub

var pubsub = require('mongoose-pubsub');
var channelName = 'news';

pubsub.subscribe(channelName, true); //subscribe
pubsub.subscribe(channelName, false); //unsubscribe

pubsub.on(channelName, function(message){
	console.log(channelName, message);
});

pubsub.send(channelName, {some: 'message'}, function(err){
  console.log('Sent message');
});
```

See the test directory for additional examples