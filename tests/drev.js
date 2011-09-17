var nodemock = require('nodemock');
var horaa = require('horaa');
var redis = horaa('redis');
var redisSimulator = require('../simulators/redis');

exports.testOn = function(test) {
	
	var ctrl = {};
	var sub = nodemock.mock('on').takes('message', function() {}).ctrl(1, ctrl);
	sub.mock('subscribe').takes('hello');
	sub.mock('on').takes('connect', function() {}).calls(1).times(2);
	sub.mock('on').takes('error', function() {}).times(2);
	sub.ignore('quit');

	redis.hijack('createClient', function() {
		return sub;
	});

	var payload = {age: 10};

	var drev = require('drev');
	drev.start();
	drev.on('hello', function(obj) {
		test.deepEqual(obj, payload);
	});

	ctrl.trigger('hello', JSON.stringify(payload));
	test.ok(sub.assert());
	redis.restore('createClient');
	test.done();
}

exports.testOnMultiple = function(test) {
	
	test.expect(4);
	var ctrl = {};
	var sub = nodemock.mock('on').takes('message', function() {}).ctrl(1, ctrl);
	sub.mock('subscribe').takes('hello');
	sub.mock('on').takes('connect', function() {}).calls(1).times(2);
	sub.mock('on').takes('error', function() {}).times(2);
	sub.ignore('quit');

	redis.hijack('createClient', function() {
		return sub;
	});

	var payload = {age: 10};

	var drev = require('drev');
	drev.stop();
	drev.start();

	drev.on('hello', function(obj) {
		test.deepEqual(obj, payload);
	});

	ctrl.trigger('hello', JSON.stringify(payload));
	ctrl.trigger('hello', JSON.stringify(payload));
	ctrl.trigger('hello', JSON.stringify(payload));

	test.ok(sub.assert());
	redis.restore('createClient');
	test.done();
}

exports.testOnNotForMe = function(test) {
	
	test.expect(1);
	var ctrl = {};
	var sub = nodemock.mock('on').takes('message', function() {}).ctrl(1, ctrl);
	sub.mock('subscribe').takes('hello');
	sub.mock('on').takes('connect', function() {}).calls(1).times(2);
	sub.mock('on').takes('error', function() {}).times(2);
	sub.ignore('quit');

	redis.hijack('createClient', function() {
		return sub;
	});

	var payload = {age: 10};

	var drev = require('drev');
	drev.stop();
	drev.start();

	drev.on('hello', function(obj) {
		test.fail();
	});

	ctrl.trigger('hello2', JSON.stringify(payload));

	test.ok(sub.assert());
	redis.restore('createClient');
	test.done();
}

exports.testOnce = function(test) {
	
	test.expect(2);

	var ctrl = {};
	var sub = nodemock.mock('on').takes('message', function() {}).ctrl(1, ctrl);
	sub.mock('subscribe').takes('hello');
	sub.mock('on').takes('connect', function() {}).calls(1).times(2);
	sub.mock('on').takes('error', function() {}).times(2);
	sub.ignore('quit');

	redis.hijack('createClient', function() {
		return sub;
	});

	var payload = {age: 10};

	var drev = require('drev');
	drev.stop();
	drev.start();
	drev.once('hello', function(obj) {
		test.deepEqual(obj, payload);
	});

	ctrl.trigger('hello', JSON.stringify(payload));
	ctrl.trigger('hello', JSON.stringify(payload));
	ctrl.trigger('hello', JSON.stringify(payload));
	test.ok(sub.assert());
	redis.restore('createClient');
	test.done();
}

exports.testInvalidPayload = function(test) {
	
	test.expect(2);

	var ctrl = {};
	var sub = nodemock.mock('on').takes('message', function() {}).ctrl(1, ctrl);
	sub.mock('subscribe').takes('hello');
	sub.mock('on').takes('connect', function() {}).calls(1).times(2);
	sub.mock('on').takes('error', function() {}).times(2);
	sub.ignore('quit');

	redis.hijack('createClient', function() {
		return sub;
	});

	var payload = {age: 10};

	var drev = require('drev');
	drev.stop();
	drev.start();
	drev.once('hello', function(msg) {
		test.deepEqual(msg, 'error data format');
	});

	ctrl.trigger('hello', "{sdsd ;sds");
	ctrl.trigger('hello', JSON.stringify(payload));
	test.ok(sub.assert());
	redis.restore('createClient');
	test.done();
}

exports.testInvalidPayload = function(test) {
	
	test.expect(2);

	var ctrl = {};
	var sub = nodemock.mock('on').takes('message', function() {}).ctrl(1, ctrl);
	sub.mock('subscribe').takes('hello');
	sub.mock('on').takes('connect', function() {}).calls(1).times(2);
	sub.mock('on').takes('error', function() {}).times(2);
	sub.ignore('quit');

	redis.hijack('createClient', function() {
		return sub;
	});

	var payload = {age: 10};

	var drev = require('drev');
	drev.stop();
	drev.start();
	drev.once('hello', function(msg) {
		test.deepEqual(msg, 'error data format');
	});

	ctrl.trigger('hello', "{sdsd ;sds");
	ctrl.trigger('hello', JSON.stringify(payload));
	test.ok(sub.assert());
	redis.restore('createClient');
	test.done();
}

exports.testEmit = function(test) {
	
	test.expect(2);

	var sub = nodemock.mock('on').takes('message', function() {});
	sub.mock('on').takes('connect', function() {}).calls(1);
	sub.mock('on').takes('error', function() {});
	sub.ignore('quit');

	var args = [10, true, {abc: 10}];
	var pub = nodemock.mock('publish').takes('hello', JSON.stringify(args));
	pub.mock('on').takes('connect', function() {}).calls(1);
	pub.mock('on').takes('error', function() {});
	pub.ignore('quit');

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
	drev.emit('hello', 10, true, {abc: 10});


	test.ok(sub.assert());
	test.ok(pub.assert());
	redis.restore('createClient');
	test.done();
}

exports.testRemoveAllListeners = function(test) {
	
	var ctrl = {};
	var sub = nodemock.mock('on').takes('message', function() {}).ctrl(1, ctrl);
	sub.mock('subscribe').takes('hello');
	sub.mock('unsubscribe').takes('hello');
	sub.mock('on').takes('connect', function() {}).calls(1).times(2);
	sub.mock('on').takes('error', function() {}).times(2);
	sub.ignore('quit');

	redis.hijack('createClient', function() {
		return sub;
	});

	var payload = {age: 10};

	var drev = require('drev');
	drev.stop();
	drev.start();
	drev.on('hello', function(obj) {
		test.fail();
	});
	drev.removeAllListeners('hello');

	ctrl.trigger('hello', JSON.stringify(payload));
	test.ok(sub.assert());
	redis.restore('createClient');
	test.done();
}

exports.testRemoveListener = function(test) {
	
	test.expect(2);

	var ctrl = {};
	var sub = nodemock.mock('on').takes('message', function() {}).ctrl(1, ctrl);
	sub.mock('subscribe').takes('hello');
	sub.mock('on').takes('connect', function() {}).calls(1).times(2);
	sub.mock('on').takes('error', function() {}).times(2);
	sub.ignore('quit');

	redis.hijack('createClient', function() {
		return sub;
	});

	var payload = {age: 10};

	var drev = require('drev');
	drev.stop();
	drev.start();

	function listener(obj) {
		test.fail();
	}

	drev.on('hello', listener);
	drev.on('hello', function(obj) {
		test.deepEqual(obj, payload);
	});
	drev.removeListener('hello', listener);

	ctrl.trigger('hello', JSON.stringify(payload));
	test.ok(sub.assert());
	redis.restore('createClient');
	test.done();
}

exports.testMaxListeners = function(test) {
	
	var ctrl = {};
	var sub = nodemock.mock('on').takes('message', function() {}).ctrl(1, ctrl);
	sub.mock('subscribe').takes('hello');
	sub.mock('on').takes('connect', function() {}).calls(1).times(2);
	sub.mock('on').takes('error', function() {}).times(2);
	sub.ignore('quit');

	redis.hijack('createClient', function() {
		return sub;
	});

	var payload = {age: 10};

	var drev = require('drev');
	drev.stop();
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


	ctrl.trigger('hello', JSON.stringify(payload));
	test.ok(sub.assert());
	redis.restore('createClient');
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
