#!/usr/bin/env node

var repl = require('repl');
var drev = require('../lib/drev');
require('colors');
var redis = require('redis');

hijackForPrinting('on');
hijackForPrinting('once');

function hijackForPrinting(method) {
	var oldMethod = drev[method];
	drev[method] = function(channel, callback) {
		
		if(!callback) {
			//setting the callback
			var sender = this.sender;
			callback = function() {
				console.log('event from channel: %s by: %s', channel, this.sender);
				for(var index in arguments) {
					console.log('\t%s - %s', parseInt(index) + 1, JSON.stringify(arguments[index]));
				}
			}
		}

		oldMethod.apply(drev, [channel, callback]);
	}; 
}

var error_showed = false;
drev.on('self::error', function(err) {
	if(!error_showed) {
		error_showed = true;
		console.log("Connection to Redis Server Breaked!");
	}
});

drev.on('self::connected', function() {
	error_showed = false;
	console.log("Connection to Redis Server Established!");
})

/////// PRINT IT  ///////

console.log('\n                       Welcome                         '.inverse.bold);
var banner = '\n\
oooooooooo.   ooooooooo.   oooooooooooo oooooo     oooo\n\
`888\'   `Y8b  `888   `Y88. `888\'     `8  `888.     .8\'\n\
 888      888  888   .d88\'  888           `888.   .8\'\n\
 888      888  888ooo88P\'   888oooo8       `888. .8\'\n\
 888      888  888`88b.     888    "        `888.8\'\n\
 888     d88\'  888  `88b.   888       o      `888\'\n\
o888bood8P\'   o888o  o888o o888ooooood8       `8\'\n\
';

console.log(banner.green.bold);
console.log('    Distributed Redis based EventEmitter for NodeJS    \n'.inverse.bold);

/////// START THE REPL //////
var r = repl.start();
r.context.drev = drev;

