const http = require('http');
const port = process.env.APP_PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200);
    res.end('OK');
  } else if (req.url === '/version') {
    res.writeHead(200);
    res.end(process.env.RELEASE_ID || 'v1');
  } else {
    res.writeHead(200);
    res.end('Hello from ' + process.env.APP_POOL);
  }
});

server.listen(port, () => {
  console.log(`App ${process.env.APP_POOL} running on port ${port}`);
});
