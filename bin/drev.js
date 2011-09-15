#!/usr/bin/env node

var repl = require('repl');
var drev = require('../lib/drev');
require('colors');

hijackForPrinting('on');
hijackForPrinting('once');

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
console.log('    Distributed Redis based EventEmitter for NodeJS    \n\n'.inverse.bold);

var r = repl.start();
r.context.drev = drev;

function hijackForPrinting(method) {
	var oldMethod = drev[method];
	drev[method] = function(channel, callback) {
		
		if(!callback) {
			//setting the callback
			callback = function() {
				console.log('event from channel: %s', channel);
				for(var index in arguments) {
					console.log('\t%s - %s', parseInt(index) + 1, JSON.stringify(arguments[index]));
				}
			}
		}

		oldMethod.apply(drev, [channel, callback]);
	}; 
}