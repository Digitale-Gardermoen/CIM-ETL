require('dotenv').config();
const https = require('https');

class CimApi {
  constructor() { }

  upsert(data) {
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

  delete(data) {
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
}