const dotenv = require('dotenv').config();
const ActiveDirectory = require('activedirectory2');

const config = {
    url: process.env.LDAPSTR,
    baseDN: process.env.BASEDN,
    username: process.env.LDAPUSER,
    password: process.env.LDAPPW,
    attributes: {
        user: [ 'sn', 'givenName', 'sAMAccountName', 'mobile', 'telephoneNumber', 'mail', 'objectSid' ]
    }
}
const ad = new ActiveDirectory(config);

let opts = {
    filter: 'objectClass=user',
    baseDN: 'OU=Users,OU=ORB,OU=Customers,DC=AD,DC=DGI,DC=NO'
}

ad.findUsers(opts, false, function(err, users) {
    if (err) {
        console.log('ERROR: ', err);
        return;
    }
    if ((! users) || (users.length == 0)) console.log('No users found.');
    else {
        console.log('findUsers: ', JSON.stringify(users, null, 2));
    }
});

