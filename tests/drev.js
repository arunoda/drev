var nodemock = require('nodemock');
var horaa = require('horaa');
var redis = horaa('redis');
var redisSimulator = require('../simulators/redis');
var Channel = require('channel');
var Drev = require('drev').Drev;

exports.testOn = function(test) {

	var simulator = redisSimulator.load();
	redis.hijack('createClient', function() {
		return simulator.createClient();
	});

	test.expect(1);
	var data = {age: 10};

	var drev = require('drev');
	drev.start();

	drev.on('hello', function(obj) {
		test.deepEqual(obj, data);
	});

	drev.emit('hello', data);
	setTimeout(function() {
		test.done();
	}, 10);
}

exports.testOnMultiple = function(test) {

	var simulator = redisSimulator.load();
	redis.hijack('createClient', function() {
		return simulator.createClient();
	});
	var payload = {age: 10};

	var drev = require('drev');
	drev.stop();
	drev.start();

	drev.on('hello', function(obj) {
		test.deepEqual(obj, payload);
	});

	drev.emit('hello', payload);
	drev.emit('hello', payload);
	drev.emit('hello', payload);

	setTimeout(function() {
		test.done();
	}, 10);
}

exports.testOnNotForMe = function(test) {
	
	var simulator = redisSimulator.load();
	redis.hijack('createClient', function() {
		return simulator.createClient();
	});
	var payload = {age: 10};

	var drev = require('drev');
	drev.stop();
	drev.start();

	drev.on('hello', function(obj) {
		test.fail();
	});

	drev.emit('hello2', payload);
	setTimeout(function() {
		test.done();
	}, 10);
}

exports.testOnce = function(test) {
	
	test.expect(1);

	var simulator = redisSimulator.load();
	redis.hijack('createClient', function() {
		return simulator.createClient();
	});

	var payload = {age: 10};

	var drev = require('drev');
	drev.stop();
	drev.start();
	drev.once('hello', function(obj) {
		test.deepEqual(obj, payload);
	});	

	drev.emit('hello', payload);
	drev.emit('hello', payload);
	drev.emit('hello', payload);

	setTimeout(function() {
		test.done();
	}, 10);
}

exports.testInvalidPayload = function(test) {
	
	var simulator = redisSimulator.load();
	var clients = [];
	redis.hijack('createClient', function() {
		var client = simulator.createClient();
		clients.push(client);
		return client;
	});

	var payload = {age: 10};

	var drev = require('drev');
	drev.stop();
	drev.start();
	drev.once('hello', function(msg) {
		test.fail('should not called because of the invalid data');
	});

	clients[0].publish('hello', 'ssds sds');

	setTimeout(function() {
		test.done();
	}, 10);
}


exports.testRemoveAllListeners = function(test) {
	
	var simulator = redisSimulator.load();
	redis.hijack('createClient', function() {
		return simulator.createClient();
	});
	var payload = {age: 10};

	var drev = new Drev();
	drev.start();
	
	drev.on('hello', function(obj) {
		test.fail('This should not get called');
	});

	drev.on('self::connected', function() {
		drev.removeAllListeners('hello');
		drev.emit('hello', payload);
	});

	test.done();
}

exports.testRemoveListener = function(test) {
	
	test.expect(1);

	var simulator = redisSimulator.load();
	redis.hijack('createClient', function() {
		return simulator.createClient();
	});

	var payload = {age: 10};

	var drev = new Drev();
	drev.start();

	function listener(obj) {
		test.fail();
	}

	drev.on('hello', listener);
	drev.on('hello', function(obj) {
		test.deepEqual(obj, payload);
	});

	drev.on('self::connected', function() {
		
		drev.removeListener('hello', listener);
		drev.emit('hello', payload);
	});

	setTimeout(function() {
		test.done();
	}, 20);
}

exports.testMaxListeners = function(test) {
	
	var simulator = redisSimulator.load();
	redis.hijack('createClient', function() {
		return simulator.createClient();
	});

	var payload = {age: 10};

	var drev = new Drev();
	drev.start();
	drev.setMaxListeners(10);
	drev.on('hello', function(obj) {
		test.deepEqual(obj, payload);
	});
	drev.on('hello', function(obj) {
		test.deepEqual(obj, payload);
	});
	drev.on('hello', function(obj) {
		test.deepEqual(obj, payload);
	});

	drev.listeners('hello')	

	drev.emit('hello', payload);
	test.done();
}

exports.testReconnect = function(test) {
	
	test.expect(2);
	var simulator = redisSimulator.load();
	var pub = simulator.createClient();
	var sub = simulator.createClient();

	var cnt = 0;
	redis.hijack('createClient', function() {
		if(cnt++ == 0) {
			return pub;
		} else {
			return sub;
		}
	});

	var drev = require('drev');
	drev.stop();
	drev.start();

	drev.on('hello', function(msg) {
		test.ok(true);
	})
	drev.emit('hello', 'hi dude');

	simulator.poweroff();
	simulator.poweron();
	drev.emit('hello', 'hi dude');
	
	setTimeout(function() {
		test.done();
	}, 100);
};

exports.testMe = function(test) {
	var simulator = redisSimulator.load();
	var pub = simulator.createClient();
	var sub = simulator.createClient();

	var cnt = 0;
	redis.hijack('createClient', function() {
		if(cnt++ == 0) {
			return pub;
		} else {
			return sub;
		}
	});

	var drev = require('drev');
	drev.stop();
	drev.start();

	test.equal(drev.me('arunoda'), undefined);
	test.equal(drev.me(), 'arunoda');
	simulator.poweroff();
	test.done();
};

exports.testSender = function(test) {
	
	test.expect(2);

	var simulator = redisSimulator.load();

	redis.hijack('createClient', function() {
		return simulator.createClient();
	});

	var Drev = require('drev').Drev;

	var c1 = new Drev();
	var c2 = new Drev();
	var c3 = new Drev();

	c1.start();
	c2.start();

	c1.on('hello', function(m) {
		test.equal(m, 'hi');
		test.equal(this.sender, 'c2');
	});

	c2.me('c2');
	c2.emit('hello', 'hi');

	setTimeout(function() {
		test.done();
	}, 20);
};

exports.testDoWork = function(test) {
	
	test.expect(6);
	var simulator = redisSimulator.load();

	redis.hijack('createClient', function() {
		return simulator.createClient();
	});

	var drev = new Drev();
	drev.start();
	drev.work('run', function(speed, length) {
		test.equal(this.sender, 'arunoda');
		test.equal(speed, 100);
		test.equal(length, '10km');
	});

	drev.me('arunoda');
	drev.do('run', 100, '10km');
	drev.do('run', 100, '10km');

	setTimeout(function() {
		test.done();
	}, 20);

};

exports.testDoWorkReconnect = function(test) {
	
	test.expect(6);
	var simulator = redisSimulator.load();

	redis.hijack('createClient', function() {
		return simulator.createClient();
	});

	var drev = new Drev();
	drev.start();
	drev.work('run', function(speed, length) {
		test.equal(this.sender, 'arunoda');
		test.equal(speed, 100);
		test.equal(length, '10km');
	});

	simulator.poweroff();
	simulator.poweron();

	setTimeout(function() {
		drev.me('arunoda');
		drev.do('run', 100, '10km');
		drev.do('run', 100, '10km');
	}, 15)

	setTimeout(function() {
		test.done();
	}, 30);

};

exports.testDoWorkMultipleWorkers = function(test) {
	
	var simulator = redisSimulator.load();

	redis.hijack('createClient', function() {
		return simulator.createClient();
	});

	var c1 = new Drev();
	var c2 = new Drev();
	var c3 = new Drev();
	c1.start();
	c2.start();
	c3.start();

	var c1Ran = false;
	var c2Ran = false;
	c1.work('run', function(speed, length) {

		c1Ran = true;
	});

	c2.work('run', function(speed, length) {

		c2Ran = true;
	});

	c3.me('arunoda');
	c3.do('run', 100, '10km');
	c3.do('run', 100, '10km');

	setTimeout(function() {
		test.ok(c1Ran);
		test.ok(c2Ran);
		test.done();
	}, 40);

};

