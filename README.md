#bitlbee-ringto

access your Ring.to messages using the CLI

Bitlbee support is on hold. currently runs standalone, only needing node.js + npm dependencies.



## Installation/running

create a `.env` file as follows:

    RINGTO_PASSWORD='lamepassword'
    RINGTO_EMAIL=chris@example.com

get dependencies then run

    npm install
    npm start

the database is saved to ~/.bitlbee-ringto/ringto.db
