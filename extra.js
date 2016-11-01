var assert = require('chai').assert;
var _ = require('lodash');
var debug = require('debug')('bitlbee-ringto');



/**
 * formatConvos
 * format the ring.to conversations object for displaying in the CLI
 */
module.exports.formatConvos = function formatConvos(convos) {
    assert.isObject(convos);
    assert.isArray(convos.data);
    assert.isString(convos.status);
    assert.isObject(convos.pagination);
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



