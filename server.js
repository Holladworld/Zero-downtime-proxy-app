const http = require('http');

let chaosMode = null;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Chaos simulation
  if (chaosMode === 'error' && req.url === '/version') {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end('{"error":"Chaos mode: 500 error"}');
  }
  
  if (chaosMode === 'timeout' && req.url === '/version') {
    // Simulate timeout - do not respond
    return;
  }
  
  // Route handling
  if (req.url === '/version') {
    const pool = process.env.APP_POOL || 'unknown';
    const releaseId = process.env.RELEASE_ID || 'unknown';
    
    res.writeHead(200, {
      'X-App-Pool': pool,
      'X-Release-Id': releaseId,
      'Content-Type': 'application/json'
    });
    res.end(`{"version":"1.0.0","pool":"${pool}","release":"${releaseId}"}`);
    
  } else if (req.url === '/healthz') {
    if (chaosMode === 'error') {
      res.writeHead(500);
      res.end('unhealthy');
    } else {
      res.writeHead(200);
      res.end('healthy');
    }
    
  } else if (req.method === 'POST' && req.url === '/chaos/start') {
    const url = require('url');
    const query = url.parse(req.url, true).query;
    chaosMode = query.mode || 'error';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(`{"status":"chaos started","mode":"${chaosMode}"}`);
    
  } else if (req.method === 'POST' && req.url === '/chaos/stop') {
    chaosMode = null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"status":"chaos stopped"}');
    
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const port = process.env.PORT || 8080;
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}, Pool: ${process.env.APP_POOL}`);
});
