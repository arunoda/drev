var redis = require('redis');
var qbox = require('qbox');
var EventEmitter = require('eventemitter2').EventEmitter2;
var Channel = require('./channel');

module.exports = new Drev();
module.exports.Drev = Drev;

function Drev() {

	var self = this;
	var pub, sub;
	var connection = qbox.create(['pub', 'sub']);
	var events = new EventEmitter();
	var connected = false;
	//no of time this has been connected
	var connectCount = 0;

	//used as the medium on the redis
	var channel = new Channel();

	var name;

	var subscriptions = {};

	this.on = function(event, callback) {

		if(isSelfEvent(event)) {
			//we dont need to subscribe with redis for self events
			events.on(event, callback);
		} else {

			connection.ready(function() {
				events.on(event, callback);
				//subscribe only if not subscribed earlier
				if(!subscriptions[event]) {
					sub.subscribe(event);
					subscriptions[event] = true;
				}
			});
		}
	};

	this.emit = function() {

		var arguments_ = arguments;
		
		connection.ready(function() {
			var eventName = arguments_[0];
			var args = [];

			for(var index in arguments_) {
				if(index!=0) {
					args.push(arguments_[index]);					
				}	
			}

			channel.clear();
			channel.setArgs(args);
			channel.setMeta('sender', name);

			pub.publish(eventName, channel.encode());
		});
	};

	this.once = function(event, callback) {
		
		connection.ready(function() {
			
			events.once(event, callback);
			//subscribe only if not subscribed earlier
			if(!subscriptions[event]) {
				sub.subscribe(event);
				subscriptions[event] = true;
			}

		});
	};

	this.removeListener = function(event, listener) {
		events.removeListener(event, listener);	
	};

	this.removeAllListeners = function(event) {
		events.removeAllListeners(event);
		sub.unsubscribe(event);
		delete subscriptions[event];
	};

	this.listeners = function(event) {
		return events.listeners(event);
	};

	this.setMaxListeners = function(n) {
		return events.setMaxListeners(n);
	};

	//adds un indentifier for me
	this.me = function(myname) {
		
		if(myname) {
			name = myname;
		} else {
			return name;
		}
	};

	/**
		Start the Connection to the Client
	*/
	this.start = function(host, port, options) {

		//if connected there is no reason to connect again
		if(connected) return;

		//reset subscriptions
		connection.reset();
		subscriptions = {};
		var reconnection = null;

		pub = redis.createClient(host, port, options);
		sub = redis.createClient(host, port, options);
		
		pub.on('connect', function() { 
			connection.tick('pub');
		});
		sub.on('connect', function() { 
			connection.tick('sub');
		});

		pub.on('error', function(err) {
			
			connected = false;
			connection.reset(); //reset the qbox ticking for the reconnect
			events.emit('self::error', err); 
		});
		sub.on('error', function(err) { 

			connected = false;
			events.emit('self::error', err); 
		});

		//event triggred when connected at initially and after every reconnect (An Qox Meth)
		connection.onStart(function() { 
			
			connected = true;			
			events.emit('self::connected'); 
			
			//reconnect all the subscriptions back except for the every first time
			if(connectCount > 0) {
				for(var event in subscriptions) {
					sub.subscribe(event);
				}
			}

			connectCount++;
		});

		sub.on('message', function(eventName, message) {
			try {
				
				channel.clear();
				channel.decode(message);
				var args = channel.getArgs();
				events.sender = channel.getMeta('sender');

				events.emit.apply(events, [eventName].concat(args));
			} catch(err) {
				console.error('Invalid Payload: %s', message);
			}

		});
	}

	/**
		Stop the connection to the redis
		@returns true if disconneted or false if already disconnected
	*/
	this.stop = function() {
		
		if(connected) {
			connected = false;	
			event = new EventEmitter();
			pub.quit();
			sub.quit();
			return true;	
		}

		connection.reset();

		return false;
	};

	function isSelfEvent(event) {
		return event.substr(0,4) == 'self';
	}
}