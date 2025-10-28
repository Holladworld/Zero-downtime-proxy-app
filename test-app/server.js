const express = require('express');
const app = express();
const port = process.env.APP_PORT || 3000;
const pool = process.env.APP_POOL || 'unknown';
const release = process.env.RELEASE_ID || 'unknown';

let chaosMode = null;

app.get('/', (req, res) => {
  handleRequest(req, res);
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/version', (req, res) => {
  handleRequest(req, res);
});

function handleRequest(req, res) {
  if (chaosMode === 'error') {
    console.log(`Chaos: Returning 500 error for ${pool}`);
    return res.status(500).json({ 
      error: 'Chaos mode: Internal Server Error',
      pool: pool,
      release: release
    });
  }
  
  if (chaosMode === 'timeout') {
    console.log(`Chaos: Simulating timeout for ${pool}`);
    // Don't send response - simulate timeout
    return;
  }
  
  // Normal response
  res.json({ 
    message: `Hello from ${pool} pool`, 
    release: release,
    pool: pool,
    headers: {
      'X-App-Pool': pool,
      'X-Release-Id': release
    }
  });
}

app.post('/chaos/start', (req, res) => {
  chaosMode = req.query.mode || 'error';
  console.log(`Chaos started on ${pool} with mode: ${chaosMode}`);
  res.json({ message: 'Chaos started', mode: chaosMode });
});

app.post('/chaos/stop', (req, res) => {
  console.log(`Chaos stopped on ${pool}`);
  chaosMode = null;
  res.json({ message: 'Chaos stopped' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Test app running on port ${port}, pool: ${pool}, release: ${release}`);
});
