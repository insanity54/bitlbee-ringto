var login = require('./login');
var db = require('./db');
var extra = require('./extra');
var CLI = require('./cli');
var debug = require('debug')('bitlbee-ringto');



var getConversations = function getConversations() {
    return login()
	.then(function(data) {
	    return db.saveConvos(data);
	})
	.then(function(data) {
	    console.log('saved convos');
	    console.log(data);
	    return data;
	});
}


var getCachedConversations = function getCachedConversations() {
    return db.loadConvos();
}




// Kick off the app.
// If there are cached conversations, display them

debug('app start');
getCachedConversations()
    .then(function(convos) {
	debug('got convos');
	debug(convos);
	return extra.formatConvos(convos);
    })
    .then(function(convos) {
	debug('  - got formatted convos');
	debug(convos);
	var cli = new CLI({conversations: convos});
	cli.start();
    })
