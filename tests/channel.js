var Channel = require('channel');

exports.testEncode = function(test) {
	
	var c = new Channel();
	c.setArgs([10, 20]);
	c.setMeta('me', 'arunoda');
	var payload = c.encode();

	var payloadJSON = JSON.parse(payload);

	test.deepEqual(payloadJSON.args, [10, 20]);
	test.deepEqual(payloadJSON.meta, {me: 'arunoda'});

	test.done();
};

exports.testDecode = function(test) {
	
	var payloadJSON = {
		meta: {
			me: 'arunoda'
		},

		args: [10, 20]
	};
	var payload = JSON.stringify(payloadJSON);

	var c = new Channel();
	c.decode(payload);

	c.setArgs([10, 20]);
	c.setMeta('me', 'arunoda');
	var payload = c.encode();

	test.deepEqual(payloadJSON.args, c.getArgs());
	test.deepEqual('arunoda', c.getMeta('me'));

	test.done();
};

exports.testClear = function(test) {
	
	var payloadJSON = {
		meta: {
			me: 'arunoda'
		},

		args: [10, 20]
	};
	var payload = JSON.stringify(payloadJSON);

	var c = new Channel();
	c.decode(payload);

	c.setArgs([10, 20]);
	c.setMeta('me', 'arunoda');
	var payload = c.encode();

	test.deepEqual(payloadJSON.args, c.getArgs());
	test.deepEqual('arunoda', c.getMeta('me'));

	c.clear();

	test.deepEqual([], c.getArgs());
	test.equal(null, c.getMeta('me'));

	test.done();
};

exports.testDecodeErrorPayload = function(test) {
	
	test.throws(function() {
		
		var c = new Channel();
		var payload = "aaf fddsfdsf";
		c.decode(payload);
	});

	test.done();
};