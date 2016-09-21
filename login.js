var rp = require('request-promise');
var debug = require('debug')('bitlbee-ringto');
var assert = require('chai').assert;


assert.isString(process.env.RINGTO_EMAIL);
assert.isString(process.env.RINGTO_PASSWORD);

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
    




// make request to log in
rp.post(makeLoginOptions())
    .then(function(body) {
	debug(typeof body);
	debug(body);
	assert.equal(body['ok'], true);
	assert.isObject(body.user);
	assert.isString(body.user.uuid);
	assert.isNull(body.error);
	assert.isNull(body.warning);

	return body.user;
    })


    .then(function(user) {

	assert.isString(user.uuid);
	uuid = user.uuid;


	// make request to get OAuth bearer token
	rp.get(makeOAuthOptions())
	    .then(function(body) {
		// get token from body
		debug(body);
		assert.equal(body['token_type'], 'bearer');
		assert.isString(body['access_token']);
		assert.isObject(body['extra_data']);
		assert.isObject(body['extra_data']['user']);
		assert.isString(body['extra_data']['user']['uuid']);
		return body;
	    })

	    .then(function(body) {
		// use uuid to create uri
		// use accessToken as authentication (in Header)
		// get SMS conversations

		var uuid = body['extra_data']['user']['uuid'];
		var accessToken = body['access_token'];
		rp.get(makeConversationOptions(uuid, accessToken))
		    .then(function(body) {
			debug(body);
			assert.equal(body.status, 'success');
			assert.isArray(body.data);
			assert.isObject(body.pagination);
			return body;
		    })
	    })
	
	

    })

