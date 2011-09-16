var drev = require('../lib/drev');
drev.once('marak', function(msg) {

	setTimeout(function() {
		console.log('ARUNODA: %s', msg)
		console.log('ME: Oh! DREV - It\'s looks like hookio :( ');
		drev.emit('arunoda', 'You! Hmmm. Looks like.... You stole my idea');
	}, 1000);
});
drev.start();
console.log("Hi I'm Marak :D ");