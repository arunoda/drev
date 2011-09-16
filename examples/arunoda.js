var drev = require('../lib/drev');
drev.on('arunoda', function(msg) {
	console.log('MARAK: %s', msg)
	console.log('ME: Marak replied me - wow very quick');
});

console.log("Hi I'm Arunoda :)")
setTimeout(function() {
	console.log('ME: I need to inform marak about the DREV');
	console.log('ME: hey! Is this looks like hook.io? It\' DREV :)');
	drev.emit('marak', 'hey! Is this looks like hook.io? It\' DREV :) ');
}, 1500);
drev.start();