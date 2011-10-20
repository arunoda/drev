var EventEmitter = require('events').EventEmitter;
var util = require('util');

exports.load = function() {
	return new Redis();	
};

function Redis() {
	
	var lists = {};
	var blpopCallbacks = {};
	var eventBus = new EventEmitter();
	var clients = [];
	this.createClient = function() {

		var client = new Client(eventBus, lists, blpopCallbacks);
		clients.push(client);

		setTimeout(function() {
			client.emit('connect');
		}, 10);
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
			}, 20);
		});
	};
}

function Client(eventBus, lists, blpopCallbacks) {
	
	var subscriptions = {};
	var self = this;

	this.subscribe = function(event) {
		
		var subs = function(message) {
			self.emit('message', event, message)
		};
		subscriptions[event] = subs;
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

	this.blpop = function(task, waitTime, callback) {

		if(lists[task] && lists[task].length > 0) {
			var pickValue = lists[task].shift();
			setTimeout(function() {
				callback(null, [task, pickValue]);
			}, 0);
		} else {
			
			if(!blpopCallbacks[task]) blpopCallbacks[task] = [];
			blpopCallbacks[task].push(callback);
		}
	};

	this.rpush = function(task, message) {

		if(blpopCallbacks[task] && blpopCallbacks[task].length >0) {
			var pick = blpopCallbacks[task].shift();
			setTimeout(function() {
				pick(null, [task, message]);
			}, 0);
		} else {
			if(!lists[task]) lists[task] = [];

			lists[task].push(message);
		}
	};

	this.quit = function() {};
	
}

util.inherits(Client, EventEmitter);