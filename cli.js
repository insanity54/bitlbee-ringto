var blessed = require('blessed');
var _ = require('lodash');
var debug = require('debug')('bitlbee-ringto');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var assert = require('chai').assert;



var CLI = function CLI(options) {

    this.mockConversations = [
	['123', 'T', '419-723-8348', 'Sam', 'hi chris'],
	['124', 'T', '808-934-2384', 'Unknown', 'Soccer practice is on Saturday @ 2. Please bring your waivers.'],
	['125', 'T', '392-823-8234', 'Purse.io', 'your order confirmation is 13428349234u89234'],
	['126', 'T', '394-382-3828', 'Ron', 'what are you doing friday?']
    ];

    this.mockMessages = [
	['000', '111', '222', '333', '444'],
	['a000', 'a111', 'a222', 'a333', 'a444'],
	['b000', 'b111', 'b222', 'b333', 'b444'],
	['c000', 'c111', 'c222', 'c333', 'c444'],
    ];

    this.opts = _.defaults(options, {conversations: this.mockConversations, messages: this.mockMessages});
    this.opts.conversations.unshift(['ID', 'R', 'Ph. #', 'Contact', 'Message']); // headings
    this.opts.messages.unshift(['heading0', 'headiing1', 'heading2', 'heading3', 'heading4']); // headings



    this.screen = blessed.screen({
	smartCSR: true
    });

    this.smsTable = blessed.listtable({
	interactive: 'true',
	border: 'line',
	style: {
	    border: {
		fg: 'red',
	    },
	    header: {
		bold: true
	    },
	    cell: {
		fg: 'green',
		selected: {
		    bg: 'blue'
		}
	    }
	},
	align: 'left',
	mouse: true,
	keys: true
    });
    
    EventEmitter.call(this);
}

util.inherits(CLI, EventEmitter);


// CLI.prototype.getPhoneIDFromMessageID = function getPhoneIDFromMessageID(messageID) {
//     var self = this;
//     assert.isString(messageID, 'messageID passed to getPhoneIDFromMessageID() was not a string');
//     var match = _.find(self.opts.conversations, function(e) {
// 	return e[0] === messageID;
//     });
//     if (typeof match === 'undefined') return null
//     return match[
// }


CLI.prototype.getPeerIDFromMessageID = function getPeerIDFromMessageID(messageID) {
    var self = this;
    assert.isString(messageID, 'messageID was not a string.');
    var match = _.find(self.opts.conversations, function(e) {
	return e[0] === messageID;
    });
    if (typeof match === 'undefined') return null
    debug('  - got peer id from message id. match=%s', match);
    return match[2]; // return the phone number (aka peerID)
}


CLI.prototype.start = function start() {
    var self = this;

    debug('  - creating cli');
    debug(self.opts.conversations);


    self.screen.title = 'SMS Engine';
    self.smsTable.focus();
    self.smsTable.setData(self.opts.conversations);


    self.screen.append(self.smsTable);

    

    // conversation clicked handler
    self.smsTable.on('action', function(a, index) {

	debug('table action was detected. a=%s, b=%s', a, index);
	var id = a.getContent().split(' ')[0];
	debug('id=%s', id);
	
	self.emit('conversationAction', id);
	//console.dir(debug(self.smsTable.getItem(index)));
    });
    


    // quit handler
    self.screen.key(['escape', 'q', 'C-c'], function(ch, key) {
	return process.exit(0);
    });

    self.screen.render();

    
    // setTimeout(function() {
    // 	debug('  - debug timeout thing');
    // 	self.smsTable.setData(self.mockMessages);
    // 	self.screen.render();
    // }, 5000);
    //this.showMessages(self.mockMessages);

}



CLI.prototype.showMessages = function showMessages(messages) {
    var self = this;
    assert.isArray(messages, 'messages passed to showMessages was not an array');
    self.opts.messages = messages;

    self.smsTable.setData(self.opts.messages);
    self.screen.render();
}


module.exports = CLI;




