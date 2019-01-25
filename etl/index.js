require('dotenv').config();
const ActiveDirectory = require('activedirectory2');
const db = require('../data/mongo.js');
const mongodb = new db();

// use a dictionary to translate the received object properties into the correct property names
const translateDict = {
  sn: 'lastname',
  givenName: 'firstname',
  sAMAccountName: 'username',
  mobile: 'job_mobile',
  telephoneNumber: 'job_phone',
  mail: 'email',
  objectSid: 'user_import_id',  // using objectSid as a import ID, seems like objectGUID sent something different than what you see in AD.
  employeeID: 'employee_id',
  company: 'org_import_id',
  title: 'job_title',
  description: 'description'
};

/* TO BE CHANGED */
const userTemplate = {
  lastname: '',
  firstname: '',
  username: '',
  user_import_id: '',
  job_mobile: '',
  job_phone: '',
  email: '',
  email_secondary: '',
  org_import_id: '',
  location_import_id: '',
  timezonee: '',
  employee_id: '',
  job_title: '',
  roles: '',
  person_type: '',
  dist_list: '',
  description: ''
};

// function to clone the userTemplate object
function getClone(obj) {
  let newobj = {};
  for (let key in obj) {      // loop over keys in the given object.
    newobj[key] = obj[key];   // copy the key properties from the given object the new object.
  }
  return newobj;
}

function translateUserData(user) {
  let userObj = getClone(userTemplate);           // create a clone of the userTemplate object. Then populate the fields with data returned from AD.
  for (let prop in translateDict) {               // loop over translateDict properties
    if (user[prop]) {                             // check if the property exists on the user, the AD call doesnt return empty values.
      userObj[translateDict[prop]] = user[prop];  // define the new userObj with the translated properties, then assign the property value from "user"
    }
  }
  return userObj;
}



async function importUser(userData) {
  /* TODO: check if the user already exists, that way we can update the user. */
  return mongodb.upsertUser(userData.user_import_id, userData);
}

const config = {
  url: process.env.LDAPSTR,       // ex: "ldap://10.0.0.1"
  baseDN: process.env.BASEDN,     // ex: "DC=AD,DC=DOMAIN,DC=NO"
  username: process.env.LDAPUSER,
  password: process.env.LDAPPW,
  attributes: {
    user: [
      'sn',
      'givenName',
      'sAMAccountName',
      'mobile',
      'telephoneNumber',
      'mail',
      'objectSid',
      'employeeID',
      'company',
      'title',
      'description'
    ]
  }
};
const ad = new ActiveDirectory(config);
let opts = {
  filter: 'objectClass=user',
  baseDN: process.env.OPTSBASEDN
};

ad.findUsers(opts, false, function (err, users) {
  if (err) {
    console.log('ERROR: ', err);
    return;
  }

  if (!users || users.length == 0) {
    console.log('No users found.');
    return;
  }

  /* TODO: Replace this array with a function or a Promise, this way we dont have to use this haggard method... */
  let arr = []; // create an array to hold callback data.

  users.forEach(user => {                     // mark that this returns an object, not an array. Use the "forEach" function, dont use the array method.
    let userData = translateUserData(user);   // translate the data from AD, this way we can match property names when importing.
    arr.push(importUser(userData));           // push the callback from the imported data into an array, this way we can force all promises to resolve.
  });

  Promise.all(arr)
    .then(function () {
      mongodb.disconnectdb();   // dc from the connection.
    })
    .catch(console.log);
});
