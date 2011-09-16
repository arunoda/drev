var redis = require('redis');
var qbox = require('qbox');
var EventEmitter = require('events').EventEmitter;

module.exports = new Drev();

function Drev() {

	var self = this;
	var pub, sub;
	var connection = qbox.create();
	var events = new EventEmitter();

	var subscriptions = {};

	this.on = function(event, callback) {

		connection.ready(function() {
			
			events.on(event, callback);
			//subscribe only if not subscribed earlier
			if(!subscriptions[event]) {
				sub.subscribe(event);
				subscriptions[event] = true;
			}

		});
	};

	this.emit = function() {

		var arguments_ = arguments;
		
		connection.ready(function() {
			var channel = arguments_[0];
			var args = [];

			for(var index in arguments_) {
				if(index!=0) {
					args.push(arguments_[index]);					
				}	
			}

			pub.publish(channel, JSON.stringify(args));
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

	/**
		Start the Connection to the Client
	*/
	this.start = function(host, port, options) {
		
		//reset subscriptions
		subscriptions = {};
		//reset eventEmitter
		events = new EventEmitter();

		pub = redis.createClient(host, port, options);
		sub = redis.createClient(host, port, options);
		connection.start();

		sub.on('message', function(channel, message) {
			
			var args;
			try{
				args = JSON.parse(message);
				args = (args instanceof Array)? args: [args];
			} catch(err) {
				args = ['error data format']; 
			}

			events.emit.apply(events, [channel].concat(args));

		});
	}
}