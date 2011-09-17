var redis = require('./redis').load();

var pub = redis.createClient();
var sub = redis.createClient();

sub.subscribe('hello');
sub.on('message', function(channel, message) {
	console.log(' %s --- %s ', channel, message);
});

sub.on('error', function() {
	console.log('SUB error occured');
});

pub.on('error', function() {
	console.log('PUB error occured');
});

sub.on('connect', function() {
	console.log('SUB connected');
});

pub.on('connect', function() {
	console.log('PUB connected');
});

pub.publish('hello', 'abc');
pub.publish('hello', 'abc');

redis.poweroff();
redis.poweron()