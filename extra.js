var assert = require('chai').assert;
var _ = require('lodash');
var debug = require('debug')('bitlbee-ringto');



/**
 * formatConvos
 * format the ring.to conversations object for displaying in the CLI
 */
module.exports.formatConvos = function formatConvos(convos) {
    assert.isObject(convos, 'convos passed to formatConvos was not an object');
    assert.isArray(convos.data, 'convos.data passed to formatConvos was not an Array');
    assert.isString(convos.status, 'convos.status passed to formatConvos was not a string');
    assert.isObject(convos.pagination, 'convos.pagination passed to formatConvos was not an object');
    assert.equal(convos.__type, 'conversation');
    assert.equal(convos.status, 'success');

    var fConvos = [];
    //debug(convos.data[0].messages);

    convos.data.forEach(function(d) {
	var msg = d.messages[0];
	             
	fConvos.push([
	    msg.message_id.toString(),                         // ID
	    (msg.read.toString() == 'true') ? 'T' : 'F',       // Read?
	    msg.from.toString(),                               // Phone Number
	    '@todo',                                           // Contact
	    msg.text.toString()                                // Message Text
	]);
    });

    return fConvos;
    //{ phone_id: 1673947, peer: '+14154032518', messages: [Object] },                                                                                          
    // [ { message_id: 49930574, phone_id: 1673947, number: '+1...', direction: 'out', from: '+1...', to: '+1...', text: 'haha ok', time: '2016-10-29T22:59:55.000Z', read: true, status: 'sent' } ]
    
    // this is what I have
    //  { messages: [] }

    // this is what I want
    //  [
    //    ['509-...', 'chris', 'hello sir'],
    //    [...]
    //  ]
}



/**
 * formatMessages
 * format the ring.to messages object for displaying in the CLI
 */
module.exports.formatMessages = function formatMessages(messages) {
    assert.isObject(messages, 'messages passed to formatMessages was not an object');
    assert.isArray(messages.data, 'messages.data passed to formatMessages was not an array');
    assert.isString(messages.status, 'messages.status passed to formatMessages was not a string');
    assert.isObject(messages.pagination, 'messages.pagination passed to formatMessages was not an object');
    assert.equal(messages.__type, 'messages');
    assert.equal(messages.status, 'success');

    var fMessages = [];
    //debug(messages.data);

    messages.data.forEach(function(d) {
	var msg = d.messages[0];

	fMessages.push([
	    msg.message_id.toString(),                         // ID
	    (msg.read.toString() == 'true') ? 'T' : 'F',       // Read?
	    msg.from.toString(),                               // Phone Number
	    '@todo',                                           // Contact
	    msg.text.toString(),                               // Message Text
	    msg.status.toString()                              // sent status
	]);
    });

    return fMessages;
}



