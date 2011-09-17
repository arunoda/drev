var EventEmitter = require('events').EventEmitter;
var util = require('util');

exports.load = function() {
	return new Redis();	
};

function Redis() {
	
	var eventBus = new EventEmitter();
	var clients = [];
	this.createClient = function() {
		var client = new Client(eventBus);
		clients.push(client);

		setTimeout(function() {
			client.emit('connect');
		}, 0);
		return client;
	};

	this.poweroff = function() {
		clients.forEach(function(client) {
			client.sendDisconnect();
		});
	};

	this.poweron = function() {
		clients.forEach(function(client) {
			setTimeout(function() {
				client.emit('connect');
			}, 10);
		});
	};
}

function Client(eventBus) {
	
	var subscriptions = {};
	var self = this;

	this.subscribe = function(event) {
		subscriptions[event] = subscriptions;
		var subs = function(message) {
			self.emit('message', event, message)
		};
		eventBus.on(event, subs);
	};

	this.unsubscribe = function(event) {
		
		var callback = subscriptions[event];
		if(callback) {
			eventBus.removeListener(event, callback);
		}	
	};

	this.publish = function(event, message) {
		eventBus.emit(event, message);
	};

	this.sendDisconnect = function() {
		for(var subscription in subscriptions) {
			eventBus.removeAllListeners(subscription);	
		}
		setTimeout(function() {
			self.emit('error');
		}, 10);
	};
	
}

util.inherits(Client, EventEmitter);