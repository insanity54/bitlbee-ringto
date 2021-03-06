var rp = require('request-promise');
var debug = require('debug')('bitlbee-ringto');
var assert = require('chai').assert;


assert.isString(process.env.RINGTO_EMAIL, 'RINGTO_EMAIL was not defined in environment');
assert.isString(process.env.RINGTO_PASSWORD, 'RINGTO_PASSWORD was not defined in environment');

var ringtoPassword = process.env.RINGTO_PASSWORD;
var ringtoEmail = process.env.RINGTO_EMAIL;



// create request to log into ring.to
// using username and password
function makeLoginOptions() {
    //debug('pass=%s, email=%s', ringtoPassword, ringtoEmail);
    return {
	uri: 'https://ring.to/ajax/user.php',
	jar: true,
	form: {
	    action: 'l',
	    email: ringtoEmail,
            password: ringtoPassword
	},
	transform: function(body) {
	    return JSON.parse(body);
	}
    };
}
    

// options for requesting SMS conversations
function makeConversationOptions(uuid, accessToken) {
    return {
	jar: true,
	headers: {
	    Authorization: 'Bearer '+accessToken
	},
	uri: 'https://partners.ring.to/api/users/'+uuid+'/messages/conversations',
	qs: {
	    page: 1,
	    page_size: 30,
	    messages: 1
	},
	transform: function(body) {
	    return JSON.parse(body);
	}
    };
}


// options for requesting SMS message threads
function makeMessagesOptions(uuid, accessToken, peer, phone_id) {
    assert.isString(uuid, 'uuid was not passed to makeMessageOptions');
    assert.isString(accessToken, 'accessToken was not passed to makeMessageOptions');
    assert.isString(peer, 'peer was not passed to makeMessageOptions');
    assert.isString(phone_id, 'phone_id was not passed to makeMessageOptions');
    return {
	jar: true,
	headers: {
	    Authorization: 'Bearer '+accessToken
	},
	uri: 'https://partners.ring.to/api/users/'+uuid+'/messages',
	qs: {
	    page: 1,
	    page_size: 30,
	    peer: peer,
	    phone_id: phone_id
	},
	transform: function(body) {
	    return JSON.parse(body);
	}
    };
}


// create request to get OAuth bearer token
function makeOAuthOptions() {
    return {
	jar: true,
	uri: 'https://partners.ring.to/api/oauth/exchange',
	qs: {
	    app: 'ringto'
	},
	transform: function(body) {
	    return JSON.parse(body)
	}
    };
}
    

var login = function login() {
    return rp.post(makeLoginOptions())
	.then(function(body) {
	    debug(typeof body);
	    debug(body);
	    assert.equal(body['ok'], true);
	    assert.isObject(body.user);
	    assert.isString(body.user.uuid, 'uuid was not in the login');
	    assert.isNull(body.error);
	    assert.isNull(body.warning);
	    return body.user;
	})
	.then(function(user) {
	    assert.isString(user.uuid, 'user.uuid was not a string');
	    uuid = user.uuid;

	    // make request to get OAuth bearer token
	    return rp.get(makeOAuthOptions())
		.then(function(body) {
		    // get token from body
		    debug(body);
		    assert.equal(body['token_type'], 'bearer', 'token_type was not bearer');
		    assert.isString(body['access_token'], 'access_token was not in OAuth data');
		    assert.isObject(body['extra_data'], 'extra_data was not in OAuth data');
		    assert.isObject(body['extra_data']['user'], 'user was not in OAuth data');
		    assert.isString(body['extra_data']['user']['uuid'], 'uuid was not in OAuth data');
		    return body;
		})
	})
}


// make request to log in
module.exports.getLogin = function getLogin() {
    return login()
	.then(function(body) {
	    // use uuid to create uri
	    // use accessToken as authentication (in Header)
	    // get SMS conversations

	    var uuid = body['extra_data']['user']['uuid'];
	    var accessToken = body['access_token'];
	    return rp.get(makeConversationOptions(uuid, accessToken))
		.then(function(body) {
		    debug(body);
		    assert.equal(body.status, 'success');
		    assert.isArray(body.data, 'body.data was not an array');
		    assert.isObject(body.pagination, 'body.pagination was not an object');
		    return body;
		})
	})
}




// log in and get messages
module.exports.getMessages = function getMessages(peer, phone_id) {
    assert.isString(peer, 'peer was not passed to getMessages().');
    assert.isString(phone_id, 'phone_id was not passed to getMessages().');
    
    return login()
	.then(function(body) {
	    // use uuid to create uri
	    // use accessToken as authentication (in Header)
	    // get SMS conversations
	    
	    assert.isString(body.extra_data.user.uuid, 'uuid was not found in response');
	    assert.isString(body.access_token, 'access_token was not found in response');
	    
	    var uuid = body['extra_data']['user']['uuid'];
	    var accessToken = body['access_token'];

	    return rp.get(makeMessagesOptions(uuid, accessToken, peer, phone_id))
		.then(function(body) {
		    debug(body);
		    assert.equal(body.status, 'success');
		    assert.isArray(body.data, 'body.data was not an array');
		    assert.isObject(body.pagination, 'body.pagination was not an object');
		    return body;
		})
	})
}
