require('dotenv').config();
const ActiveDirectory = require('activedirectory2');
const MongoDB = require('../data/mongo.js');
const adUsers = new MongoDB();

// use a dictionary to translate the received object properties into the correct property names
const translateDict = {
  sn: 'lastname',
  givenName: 'firstname',
  sAMAccountName: 'username',
  objectSid: 'user_import_id',
  mobile: 'job_mobile',
  telephoneNumber: 'job_phone',
  mail: 'email',
  employeeID: 'employee_id',
  title: 'job_title',
  description: 'description',
  objectClass: 'person_type'
};

// these properties are set to null to include these since the scheme requires a "OneOf".
// see importTemplate.json for more info.
const userTemplate = {
  email: null,
  email_secondary: null,
  timezone: null,
  dist_list: null
};

function getClone(obj) {
  let newobj = {};
  for (let key in obj) {      // loop over keys in the given object.
    newobj[key] = obj[key];   // copy the key properties from the given object the new object.
  }
  return newobj;
}

async function aduserFactory(user, dictionary) {
  let userObj = getClone(userTemplate);           // create a clone of the userTemplate object. Then populate the fields with data returned from AD.
  for (let prop in dictionary) {                  // loop over translateDict properties
    if (user[prop]) {                             // check if the property exists on the user, the AD call doesnt return empty values.
      userObj[dictionary[prop]] = user[prop];     // define the new userObj with the translated properties, then assign the property value from "user"
    }
  }
  return userObj;
}

const userADtrib = [
  'sn',
  'givenName',
  'sAMAccountName',
  'mobile',
  'telephoneNumber',
  'mail',
  'objectSid',
  'employeeID',
  'title',
  'description',
  'objectClass'
]

const config = {
  url: process.env.LDAP_CONNSTR,
  baseDN: process.env.LDAP_BASEDN,
  username: process.env.LDAP_USERNAME,
  password: process.env.LDAP_PASSWORD,
  attributes: {
    user: userADtrib
  }
};

let qryOpts = {
  filter: 'objectClass=user',
  baseDN: process.env.LDAP_QUERY_OPTS_BASEDN
};

class LdapLoader {
  constructor() {
    this.ad = new ActiveDirectory(config);  // connect to AD with the current config.
  }

  async importUsers() {
    adUsers.deleteADUsers();  // delete all AD users in the mongodb.
    this.ad.findUsers(qryOpts, false, function (err, users) {
      if (err) {
        console.log('ERROR: ', err);
        return;
      }

      if (!users || users.length == 0) {
        console.log('No users found.');
        return;
      }

      let userData = []   // create array to hold the translated userData.

      users.forEach(user => {                               // mark that this returns an object, not an array. Use the "forEach" function, dont use the array method.
        user.objectClass = 'user';                          // currently just used set the person_type to user, we are only fetching users.
        userData.push(aduserFactory(user, translateDict));  // translate the data from AD, this way we can match property names when importing.
      });

      Promise.all(userData)             // wait for the array of user objects to be processed through the factory.
        .then(users => {
          adUsers.insertADUsers(users); // import all the users to the mongodb. Dont match anything, the collection should be empty.
        })
        .catch(console.log);
    });
  }

  async getUsers() {
    return adUsers.fetchADUsers();
  }
}

module.exports = LdapLoader;