
var ringto = require('./ringto');
var db = require('./db');
var extra = require('./extra');
var CLI = require('./cli');
var debug = require('debug')('bitlbee-ringto');
var Promise = require('bluebird');
var assert = require('chai').assert;



var getConversations = function getConversations() {
    return ringto.getLogin()
	.then(function(data) {
	    return db.saveConvos(data);
	})
	.then(function(data) {
	    debug('  - saved convos');
	    debug(data);
	    return data;
	});
}


/**
 * getMessages
 *
 * retrieve message thread from ring.to
 *
 * @param {string} peer       - the phone number of the other party in the conversation (your friend; not you)
 *                              number is 11 digit, containing country code and prepended with "+" ex: '+14548723691'
 * @param {string} phoneID    - the ring.to phone (account) ID.
 */
var getMessages = function getMessages(peer, phoneID) {
    return ringto.getMessages(peer, phoneID)
	.then(function(data) {
	    return db.saveMessages(data);
	})
	.then(function(data) {
	    debug('  - saved messages');
	    debug(data);
	});
}


var getCachedConversations = function getCachedConversations() {
    return db.loadConvos();
}


var getCachedMessages = function getCachedMessages() {
    return db.loadMessages();
}




// Kick off the app.
// If there are cached conversations, display them

debug('app start');
getCachedConversations()
    .then(function(convos) {
	debug('got convos');
	debug(convos);

	// if cache is empty, fetch fresh data
	if (typeof convos === 'undefined') {
	    return getConversations()
		.then(function(convos) {
		    return extra.formatConvos(convos)
		})
	}

	return extra.formatConvos(convos);
    })

    .then(function(convos) {
	debug('  - got formatted convos');
	debug(convos);
	var cli = new CLI({conversations: convos});
	cli.start();
	return cli;
    })
    .then(function(cli) {
	// listen for cli events
	// return only when cli closes

	return new Promise(function(resolve, reject) {
	    cli.once('conversationAction', function(messageID) {
		debug('  - [EVENT] heard conversation action event on CLI');
		debug(messageID);
		var d = {};
		d.peerID = cli.getPeerIDFromMessageID(messageID);
		d.messageID = db.getPhoneIDFromMessageID(messageID);
		resolve(d);
	    });
	    
	    cli.once('exit', function() {
		reject('exiting');
	    });
	});
    })
    .catch(function(err) {
	debug('  - caught err=%s', err);
	if (err == 'exiting') {
	    return process.exit(0)
	}
    })
    .then(function(peerID) {
	assert.isString(peerID, 'peerID was not a string');
	return ringto.getMessages(peerID, phoneID);
    })
    .then(function(data) {
	debug('  - got message data in main flo');
	assert.isObject(data, 'data received from ringto.getMessages() was not an object')
	
	return extra.formatMessages(data)
    })
    .then(function(messages) {
	debug('  - got formatted messages');
	cli.showMessages(messages);
	return cli;
    })
    .then(function(cli) {
	debug('  - showing messages');
	// listen for cli events
	// return only when cli exits
	return new Promise(function(resolve, reject) {
	    cli.once('messageAction', function(messageID) {
		debug('  - [EVENT] heard messageAction on CLI')
		return '@todo';
	    });
	    
	    cli.once('exit', function() {
		reject('exiting');
	    })
	})
    })
    .catch(function(e) {
	debug('  - caught err=%s', e);
	if (e === 'exiting') return process.exit(0)
    });

