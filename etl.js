require("dotenv").config();
const ActiveDirectory = require("activedirectory2");
const db = require("./mongo.js");

const config = {
  url: process.env.LDAPSTR,
  baseDN: process.env.BASEDN,
  username: process.env.LDAPUSER,
  password: process.env.LDAPPW,
  attributes: {
    user: [
      "sn",
      "givenName",
      "sAMAccountName",
      "mobile",
      "telephoneNumber",
      "mail",
      "objectSid"
    ]
  }
};
const ad = new ActiveDirectory(config);
let opts = {
  filter: "samaccountname=joinge-orb",
  baseDN: "OU=Users,OU=ORB,OU=Customers,DC=AD,DC=DGI,DC=NO"
};

const conn = new db();

// use a dictionary to translate the received object properties into the correct property names
let translateDict = {
  sn: "lastname",
  givenName: "firstname",
  sAMAccountName: "username",
  mobile: "job_mobile",
  telephoneNumber: "job_phone",
  mail: "email",
  objectSid: "user_import_id" // using objectSid as a import ID, seems like objectGUID sent something different than what you see in AD.
};

function translateUserData(user) {
  let userObj = {};
  for (let prop in translateDict) {
    // loop over translateDict properties
    if (user[prop]) {
      // check if the property exists on the user, the AD call doesnt return empty values.
      userObj[translateDict[prop]] = user[prop]; // define the new userObj with the translated properties, then assign the property value from "user"
    }
  }
  return userObj;
}

async function importUser(userData) {
  // start the mongo import.
  // check if the user already exists, that way we can update the user.
  console.log("importing user... ", userData.username);
  return conn.findUser(userData.username);
}

ad.findUsers(opts, false, function(err, users) {
  if (err) {
    console.log("ERROR: ", err);
    return;
  }
  if (!users || users.length == 0) {
    console.log("No users found.");
    return;
  }
  //console.log('findUsers: ', users);//JSON.stringify(users, null, 2));
  let arr = [];
  console.log(users.length);
  // mark that this returns an object, not an array. Use the "forEach" function, dont use the array method.
  users.forEach(user => {
    let userData = translateUserData(user);
    arr.push(importUser(userData));
  });
  Promise.all(arr)
    .then(function(res) {
      console.log(res);
      conn.conn.close();
    })
    .catch(console.log);
});

let importSchema = {
  lastname: "Doe",
  firstname: "John",
  username: "johndoe",
  user_import_id: "johndoe1",
  job_mobile: "+4712345678",
  job_phone: "+4787654321",
  email: "johndoe@company.no",
  email_secondary: "john.doe@gmail.com",
  org_import_id: "ORG-2",
  location_import_id: "Stockholm 456",
  timezonee: "Europe/Stockholm",
  employee_id: "A000011",
  job_title: "CTO",
  roles: "Admin,Test role",
  person_type: "user",
  dist_list: "Administrators, Test",
  description: "John is allergic to peanuts"
};
