const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/version') {
    res.setHeader('X-App-Pool', 'green');
    res.setHeader('X-Release-Id', 'green-v1.0.0');
    res.setHeader('Content-Type', 'application/json');
    res.end('{"version":"1.0.0","pool":"green","release":"green-v1.0.0"}');
  } else if (req.url === '/healthz') {
    res.end('healthy');
  } else {
    res.end('OK');
  }
});
server.listen(8080);
