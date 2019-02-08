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

function upsertCIM(data) {
  const options = {
    protocol: 'https:',
    hostname: process.env.HTTPSHOST,
    port: 443,
    path: process.env.HTTPSUSRT,
    method: 'POST',
    auth: process.env.HTTPSAUTH,
    agent: false,
    headers: {
      'Content-Length': Buffer.byteLength(data),
      'Content-Type': 'application/json'
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
}

function deleteCIM(data) {
  const options = {
    protocol: 'https:',
    hostname: process.env.HTTPSHOST,
    port: 443,
    path: process.env.HTTPSDELT,
    method: 'POST',
    auth: process.env.HTTPSAUTH,
    agent: false,
    headers: {
      'Content-Length': Buffer.byteLength(data),
      'Content-Type': 'application/json'
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
}

/* TO BE CHANGED *//* I want to have this in a function, as it will be a common Job. */
fetch
  .then(async function (users) {
    mongodb.disconnectdb(); // dc from mongo
    data = JSON.stringify(users, null, 2);  // data has to be string to get the length. ALSO needs to be an array even if only one i returned.
    upsertCIM(data);
  })
  .catch(console.log);
