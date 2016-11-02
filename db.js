var nedb = require('nedb');
var path = require('path');
var os = require('os');
var Promise = require('bluebird');
var assert = require('chai').assert;
var moment = require('moment');
var debug = require('debug')('bitlbee-ringto');
var _ = require('lodash');


var db = new nedb({
    filename: path.join(os.homedir(), '.bitlbee-ringto', 'ringto.db'),
    autoload: true
});

Promise.promisifyAll(db);


var reverseCronologicalSort = function reverseCronologicalSort(a, b) {
    if (a['__insertDate'] < b['__insertDate'])
	return 1;
    if (a['__insertDate'] > b['__insertDate'])
	    return -1;
    return 0;
}



module.exports.saveMessages = function saveMessages(responseData) {
    assert.isObject(responseData, 'responseData was not an object');
    assert.isArray(responseData.data, 'responseData.data was not an array');
    assert.isString(responseData.status, 'responseData.status was not a string');
    assert.isObject(responseData.pagination, 'responseData.pagination was not an object.');
    assert.isUndefined(responseData.__insertDate, 'responseData.__insertDate was defined.');
    assert.isUndefined(responseData.__type, 'responseData.__type was defined.');
    assert.equal(responseData.status, 'success');

    
    responseData.__type = 'messages';
    responseData.__insertDate = moment().valueOf(); 
    return db.insertAsync(responseData);
}


module.exports.saveConvos = function saveConvos(responseData) {
    assert.isObject(responseData, 'responseData was not an object');
    assert.isArray(responseData.data, 'responseData.data was not an array');
    assert.isString(responseData.status, 'responseData.status was not a string');
    assert.isObject(responseData.pagination, 'responseData.pagination was not an object.');
    assert.isUndefined(responseData.__insertDate, 'responseData.__insertDate was defined.');
    assert.isUndefined(responseData.__type, 'responseData.__type was defined.');
    assert.equal(responseData.status, 'success');

    
    responseData.__type = 'conversation';
    responseData.__insertDate = moment().valueOf(); 
    return db.insertAsync(responseData);
}


module.exports.getPeerIDFromMessageID = function getPeerIDFromMessageID(messageID) {
    debug('  - looking up peerID from messageID=%s', messageID);
    return db.findOneAsync({ data: { $elemMatch: { messages: { $elemMatch: { id: messageID } } } } })
}

module.exports.getPhoneIDFromMessageID = function getPhoneIDFromMessageID(messageID) {
    return db.findOneAsync({
	__type: 'conversation',
	data: { $exists: true },
	"data.messages": { $exists: true}
    })
	.then(function(matches) {
	    debug('  - got matches');
	    var res=null;

	    var conversations = matches.data;

	    // iterate through conversations
	    for (var i=0; i < conversations.length; i++) {
		if (res !== null) break // if we found the phoneID, stop looping
		debug('iterating convo');
		debug(conversations[i]);


		// iterate through messages
		var messages = conversations[i].messages;
		for (var j=0; j < messages.length; j++) {
		    debug('iterationg messages');
		    debug(messages[j])
		    

		    var inspected = messages[j].message_id.toString();
		    debug('comparing %s to %s', inspected, messageID);
		    if (inspected === messageID) {
			res = messages[j].phone_id.toString();
			break;
		    }
		}
	    }

	    return res;
	    
	})
}


module.exports.pruneConvos = function pruneConvos() {
    // if the convos cache is getting large, discard old records
    return db.findAsync({ __type: 'conversation' })
	.then(function(convos) {
	    var pruneIndex = 3; // delete records older than this index
	    if (convos.length > pruneIndex) {
		// get the oldest conversations (cache history > pruneIndex)
		var oldRecords = convos.sort(reverseCronologicalSort).slice(pruneIndex, convos.length);
		
		debug('  - deleting old conversation cache.');
		debug(_.mapKeys(oldRecords, '_id'));
		
		// remove cache history pruneIndex and beyond
		return db.removeAsync({ $and: _.mapKeys(oldRecords, '_id') });
	    }
	})
}

module.exports.loadConvos = function loadConvos() {
    // a little house keeping
    return this.pruneConvos()
        .then(function() {
	    // find convos
            return db.findAsync({ __type: 'conversation' })
	})
	.then(function(convos) {

	    // there will likely be more than one cached convos object, so return the lastest.
	    var res = convos.sort(reverseCronologicalSort);

	    debug('  - sorted cache');
	    debug(res);
	    return res[0];
	});
}


module.exports.pruneMessages = function pruneMessages() {
    return db.findAsync({ __type: 'messages' })
	.then(function(messages) {
	    var pruneIndex = 256; // delete records older than this index
	    if (messages.length > pruneIndex) {
		// get the oldest conversations (cache history > pruneIndex)
		var oldRecords = messages.sort(reverseCronologicalSort).slice(pruneIndex, messages.length);
		
		debug('  - deleting old messages cache.');
		debug(_.mapKeys(oldRecords, '_id'));
		
		// remove cache history pruneIndex and beyond
		return db.removeAsync({ $and: _.mapKeys(oldRecords, '_id') });
	    }
	})

}


module.exports.loadMessages = function loadMessages(peerID) {
    return this.pruneMessages()
	.then(function() {
	    // find messages
	    return db.findAsync({ __type: 'messages',  });
	})
	.then(function(messages) {
	    var res = messages.sort(reverseCronologicalSort);
	    
	    debug('  - sorted messages cache');
	    debug(res);
	    return res[0];
	});
}
