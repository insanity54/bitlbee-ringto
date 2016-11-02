var mocha = require('mocha');
var assert = require('chai').assert;
var db = require('../db');
var debug = require('debug')('bitlbee-ringto');




describe('getPeerIDFromMessageID', function() {
    it('should return a phoneID', function() {
	return db.getPhoneIDFromMessageID('5113005')
	    .then(function(phoneID) {
		debug(phoneID);
		assert.isString(phoneID);
	    });
    });
})




