const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('certs/priv-key.pem'),
  cert: fs.readFileSync('certs/pub-cert.pem')
};

https
  .createServer(options, (req, res) => {
    if (req.url == '/post') {
      let body = '';
      console.log(req.headers);
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        console.log(body);
        res.end('test');
      });
    } else {
      res.writeHead(200);
      res.end('hello world\n');
    }
  })
  .listen(8000);
console.log('Server running.');
