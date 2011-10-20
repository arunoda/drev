var redis = require('../simulators/redis');

exports.testBlPop = function(test) {
	
	test.expect(1);
	var r = redis.load();
	var c1 = r.createClient();
	var c2 = r.createClient();

	c1.blpop('hi', 0, function(err, input) {
		test.deepEqual(['hi', 'msg'], input);
	});

	c2.rpush('hi', 'msg');
	
	setTimeout(function() {
		test.done();
	}, 3);
};

exports.testBlPopQueuing = function(test) {
	
	test.expect(2);
	var r = redis.load();
	var c1 = r.createClient();
	var c2 = r.createClient();

	c2.rpush('hi', 'msg');
	c2.rpush('hi', 'msg2');

	c1.blpop('hi', 0, function(err, input) {
		test.deepEqual(['hi', 'msg'], input);
	});

	c1.blpop('hi', 0, function(err, input) {
		test.deepEqual(['hi', 'msg2'], input);
	});

	setTimeout(function() {
		test.done();
	}, 15);
};

exports.testBlPopMultiQueuing = function(test) {
	
	test.expect(4);
	var r = redis.load();
	var c1 = r.createClient();
	var c2 = r.createClient();

	c2.rpush('hi', 'msg');
	c2.rpush('by', 'msg1');
	c2.rpush('hi', 'msg2');
	c2.rpush('by', 'msg2');

	c1.blpop('hi', 0, function(err, input) {
		test.deepEqual(['hi', 'msg'], input);
	});

	c1.blpop('by', 0, function(err, input) {
		test.deepEqual(['by', 'msg1'], input);
	});

	c1.blpop('by', 0, function(err, input) {
		test.deepEqual(['by', 'msg2'], input);
	});

	c1.blpop('hi', 0, function(err, input) {
		test.deepEqual(['hi', 'msg2'], input);
	});

	setTimeout(function() {
		test.done();
	}, 15);
};