require('dotenv').config();
const https = require('https');
const db = require('../data/mongo.js'); // remove the db import in this file. I want the ETL file to do this.
const mongodb = new db();

// create the function as a promise even if it returns a promise already.
// for some reason this works to resolve the Promise, but doing it without makes the function return an unresolved Promise.
let fetch = new Promise((reject, resolve) => {
  mongodb
    .fetchUsers()
    .then(function (err, res) {
      if (err) reject(err);
      resolve(res);
    })
    .catch(console.log);
});



// create the client here, currently i just want to use POST.
// most of this is from the getting started guide.
/* TO BE CHANGED */
fetch
  .then(function (users) {
    mongodb.disconnectdb(); // dc from mongo
    data = JSON.stringify(users, null, 2);
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/post',
      method: 'POST',
      agent: false,
      rejectUnauthorized: false,
      headers: {
        'Content-Length': Buffer.byteLength(data),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const req = https.request(options, res => {
      console.log('statuscode: ', res.statusCode);
      console.log('headers: ', res.headers);
      res.setEncoding('utf8');
      res.on('data', chunk => {
        console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        console.log('No more data in response.');
      });
    });

    req.on('error', e => {
      console.error(e);
    });

    req.write(data);
    req.end();
  })
  .catch(console.log);
