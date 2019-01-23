require("dotenv").config();
const https = require('https');
const db = require('./mongo.js')
const mongodb = new db();


// create the function as a promise even if it returns one.
// for some reason this works to resolve the Promise, but doing it without makes the function return an unresolved Promise.
let fetch = new Promise((reject, resolve) => {
  mongodb.fetchUsers()
    .then(function(err, res) {
      if (err) reject(err);
      resolve(res);
    })
    .catch(console.log);
});

// example
fetch
  .then(function(users) {
    mongodb.conn.close();
  })
  .catch(console.log);

//create the client here, currently i just want to use POST.
const options = {
  hostname: 'encrypted.google.com',
  port: 443,
  path: '/',
  method: 'GET',
  agent: false
}
const req = https.request(options, (res) => {
  console.log('statuscode: ', res.statusCode);
  console.log('headers: ', res.headers);

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();