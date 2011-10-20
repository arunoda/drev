/**
	Defines the Datachanel traverse whithin redis
	Endcode and Decode
*/

module.exports = Channel;

function Channel() {
	
	var args = [];
	var meta = {};

	/**
		Set Array of Args
	*/
	this.setArgs = function(args_) {
		args = args_;
	};

	this.getArgs = function() {
		return args;	
	};

	this.setMeta = function(key, value) {
		meta[key] = value;
	};

	this.getMeta = function(key) {
		return meta[key];	
	};

	this.encode = function() {
		
		var container = {
			args: args,
			meta: meta
		};
		
		return JSON.stringify(container);	
	};

	this.decode = function(payload) {
		
		var container = JSON.parse(payload);
		args = (container)? container.args: [];
		meta = (container)? container.meta: {};
	};

	this.clear = function() {
		args = [];
		meta = {};	
	};
};