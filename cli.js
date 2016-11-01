var blessed = require('blessed');
var _ = require('lodash');
var debug = require('debug')('bitlbee-ringto');


var CLI = function CLI(options) {

    var mockSMSs = [
	['123', 'true', '419-723-8348', 'Sam', 'hi chris'],
	['124', 'true', '808-934-2384', 'Unknown', 'Soccer practice is on Saturday @ 2. Please bring your waivers.'],
	['125', 'true', '392-823-8234', 'Purse.io', 'your order confirmation is 13428349234u89234'],
	['126', 'false', '394-382-3828f', 'Ron', 'what are you doing friday?']
    ];

    this.opts = _.defaults(options, {conversations: mockSMSs});
    this.opts.conversations.unshift(['ID', 'Read?', 'Phone number', 'Contact', 'Message']);



    this.screen = blessed.screen({
	smartCSR: true
    });

    this.smsTable = blessed.listtable({
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

}


CLI.prototype.start = function start() {
    var self = this;

    debug('  - creating cli');
    debug(self.opts.conversations);


    self.screen.title = 'SMS Engine';
    self.smsTable.focus();
    self.smsTable.setData(self.opts.conversations);


    self.screen.append(self.smsTable);


    // quit
    self.screen.key(['escape', 'q', 'C-c'], function(ch, key) {
	return process.exit(0);
    });

    self.screen.render();

}


module.exports = CLI;




