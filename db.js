var nedb = require('nedb');
var path = require('path');
var os = require('os');
var Promise = require('bluebird');
var assert = require('chai').assert;
var moment = require('moment');
var debug = require('debug')('bitlbee-ringto');


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



module.exports.saveConvos = function saveConvos(responseData) {
    assert.isObject(responseData);
    assert.isArray(responseData.data);
    assert.isString(responseData.status);
    assert.isObject(responseData.pagination);
    assert.isUndefined(responseData.__insertDate);
    assert.isUndefined(responseData.__type);
    assert.equal(responseData.status, 'success');

    
    responseData.__type = 'conversation';
    responseData.__insertDate = moment().valueOf(); 
    return db.insertAsync(responseData);
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
