const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/version') {
    res.setHeader('X-App-Pool', 'blue');
    res.setHeader('X-Release-Id', 'blue-v1.0.0');
    res.setHeader('Content-Type', 'application/json');
    res.end('{"version":"1.0.0","pool":"blue","release":"blue-v1.0.0"}');
  } else if (req.url === '/healthz') {
    res.end('healthy');
  } else {
    res.end('OK');
  }
});
server.listen(8080);
