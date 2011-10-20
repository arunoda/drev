DREV - Distributed Redis based EventEmitter for NodeJS
======================================================

As the name implied DREV is an port of EventEmmiter (which is available of NodeJS core) but works truly distribute manner. That means you can easily communicate between

* Processes
* Platforms
* Operating Systems

<h3>***** Now You can use `drev` as a work queue too. (See for API below)  ***** </h3>

Wow - What's the Magic
----------------------
No there is no magic. Drev is backed by Redis and simplifies it's pub/sub facility. DREV is very compact and it's about ~100 lines of code.

Motivation
----------
Hook.io - But It's not a hook.io clone. But a better redis client

What we can do
--------------
DREV is a NodeJS library. (Wait I'll show some samples..) You can embed this with your stuff in seconds. 
You can write small applications (Node Scripts) which does only 2 thing. Which are,

	* Listening for Events do some task (on)
	* Ask someone to do somesomething you want to do (emit)

All these applications are independent and loosly coupled. Since DREV is distributed you can run these NodeJS applications in diffrent platforms and you can scale smoothly.

Installation
------------

	sudo npm install drev -g

Dependancy
----------
You need to have Redis(redis.io) in order to use DREV. Install and run it. Installation is simple - Visit http://redis.io 

Example
-------

	---------------------------------------------------------------------------------

	//arunoda.js
	var drev = require('drev');
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

	----------------------------------------------------------------------------------

	//marak.js
	var drev = require('drev');
	drev.once('marak', function(msg) {

		setTimeout(function() {
			console.log('ARUNODA: %s', msg)
			console.log('ME: Oh! DREV - It\'s looks like hookio :( ');
			drev.emit('arunoda', 'You! Hmmm. Looks like.... You stole my idea');
		}, 1000);
	});
	drev.start();
	console.log("Hi I'm Marak :D ");

	----------------------------------------------------------------------------------


First Run `marak.js` in one terminal and `arunoda.js` in other terminal. See the result your self :)

I need to play with this
------------------------
Cool. We've a REPL tooo. type `drev` in your terminal and start few more and play with them.

Oh! wait. API?
--------------

### EventEmitter

Since this is EventEmitter. You can always refer official NodeJS docs (http://nodejs.org/docs/v0.4.11/api/events.html)
And make sure you start the drev by `drev start()`.
Happy hacking :)

### Work Queue

Drev Work Queue equally balanced Work Queue and can be worked across processes

#### work
allow to define an task and it's functionality
eg:-

	drev.work('taskName', function(p1, p2) {
		//do the action
	});

#### do
commading to to an task
eg:-

	drev.do('taskName', 'p1', 'p2');

### Named Drevs
You can define a name for an drev process which help others to identify the sender

#### me
set the name for the drev
	
	drev.me('arunoda');

#### using it

	drev.once('event', function() {
		var sender = this.sender; //if the emitter of this event idenfied himself
	});

	drev.work('task', function() {
		var sender = this.sender; //if the emitter of this event idenfied himself
	});


Distributed! How?
----------------
As I said you. This is redis based :) By default it works with default configurations. If you need to work distributely it's simple too. Follow these steps.

* Install start redis server in one of your server
* Start drev in your application saying information about the Redis.
	`drev.start(redisPort, redisHost)`
* Feel free and play distributely