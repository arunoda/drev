var redis = require('redis');
var qbox = require('qbox');
var EventEmitter = require('eventemitter2').EventEmitter2;
var Channel = require('./channel');

module.exports = new Drev();
module.exports.Drev = Drev;

function Drev() {

	var self = this;
	var pub, sub;
	var pubConnection = qbox.create();
	var subConnection = qbox.create();

	var events = new EventEmitter();
	var connected = false;
	//no of time this has been connected
	var connectCount = 0;

	//used as the medium on the redis
	var channel = new Channel();

	var name;

	var subscriptions = {};

	//redis info
	var connInfo = {
		host: null,
		port: null,
		options: null
	}

	this.on = function(event, callback) {

		if(isSelfEvent(event)) {
			//we dont need to subscribe with redis for self events
			events.on(event, callback);
		} else {

			subConnection.ready(function() {
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
		
		pubConnection.ready(function() {
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
		
		subConnection.ready(function() {
			
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
		Assign a work to do for an task
	*/
	this.work = function(task, callback) {
		
		var connection = redis.createClient(connInfo.port, connInfo.host, connInfo.options);

		function worker(taskName, input) {
		
			try{
				channel.clear();
				channel.decode(input[1]);
				var args = channel.getArgs();
				var sender = channel.getMeta('sender');

				callback.apply({sender: sender}, args);
			} catch(err) {
				console.error(err);
				console.error('Invalid Payload on worker: task = %s, message = %s',input[0], input[1]);
			}
			//look for again
			connection.blpop(task, 0, worker);
		}
		
		connection.on('connect', function() {
			connection.blpop(task, 0, worker);		
		});

		connection.on('error', function() {
		
		});
	};

	/**
		Command some process to do the job
	*/
	this.do = function() {
		
		var arguments_ = arguments;
		
		pubConnection.ready(function() {
			var taskName = arguments_[0];
			var args = [];

			for(var index in arguments_) {
				if(index!=0) {
					args.push(arguments_[index]);					
				}	
			}

			channel.clear();
			channel.setArgs(args);
			channel.setMeta('sender', name);

			pub.rpush(taskName, channel.encode());
		});
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
		subConnection.reset();
		pubConnection.reset();
		subscriptions = {};
		var reconnection = null;

		sub = redis.createClient(port, host, options);
		pub = redis.createClient(port, host, options);
		
		pub.on('connect', function() { 

			console.log('pubConnected');
			pubConnection.start();
		});
		sub.on('connect', function() { 

			console.log('subConnected');
			subConnection.start();
		});

		pub.on('error', function(err) {
			
			console.log('pub error');
			connected = false;
			pubConnection.reset(); //reset the qbox ticking for the reconnect
			events.emit('self::error', err); 
		});
		sub.on('error', function(err) { 

			console.log('sub error');
			connected = false;
			subConnection.reset();
			events.emit('self::error', err); 
		});

		//event triggred when connected at initially and after every reconnect (An Qox Meth)
		subConnection.onStart(function() { 
			
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

		pubConnection.onStart(function() { 
			
			connected = true;			
		});

		sub.on('message', function(eventName, message) {
			try {
				
				channel.clear();
				channel.decode(message);
				var args = channel.getArgs();
				events.sender = channel.getMeta('sender');
				events.emit.apply(events, [eventName].concat(args));
			} catch(err) {
				console.log(err);
				console.error('Invalid Payload: %s', message);
			}

		});

		//update Conf Info
		connInfo.host = host;
		connInfo.port = port;                                                                                                                                                                                                                                                                
		connInfo.options = options;
	}

	/**
		Stop the connection to the redis
		@returns true if disconneted or false if already disconnected
	*/
	this.stop = function() {
		
		if(connected) {
			connected = false;	
			events = new EventEmitter();
			pub.quit();
			sub.quit();
			return true;	
		}

		pubConnection.reset();
		subConnection.reset();

		return false;
	};

	function isSelfEvent(event) {
		return event.substr(0,4) == 'self';
	}
}
