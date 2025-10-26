const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const appPool = process.env.APP_POOL || 'unknown';
const releaseId = process.env.RELEASE_ID || 'unknown';

app.use(express.json());

let chaosMode = null;

// GET /version - returns JSON and headers (REQUIRED)
app.get('/version', (req, res) => {
  console.log(`/version called - Chaos mode: ${chaosMode}, Pool: ${appPool}`);
  
  if (chaosMode === 'error') {
    console.log('Returning 500 due to chaos mode');
    return res.status(500).json({ error: 'Chaos mode: error' });
  }
  
  if (chaosMode === 'timeout') {
    console.log('Simulating timeout');
    return setTimeout(() => {
      res.status(200).json({ message: 'Delayed response' });
    }, 10000); // 10 second timeout
  }
  
  res.set({
    'X-App-Pool': appPool,
    'X-Release-Id': releaseId,
    'Content-Type': 'application/json'
  });
  
  res.json({
    version: '1.0.0',
    pool: appPool,
    release: releaseId,
    timestamp: new Date().toISOString()
  });
});

// POST /chaos/start - simulates downtime (REQUIRED)
app.post('/chaos/start', (req, res) => {
  const mode = req.query.mode || 'error';
  chaosMode = mode;
  console.log(`Chaos started: ${mode} for pool: ${appPool}`);
  res.json({ 
    status: 'chaos started', 
    mode: mode,
    pool: appPool 
  });
});

// POST /chaos/stop - ends simulated downtime (REQUIRED)
app.post('/chaos/stop', (req, res) => {
  chaosMode = null;
  console.log(`Chaos stopped for pool: ${appPool}`);
  res.json({ 
    status: 'chaos stopped',
    pool: appPool 
  });
});

// GET /healthz - process liveness (REQUIRED)
app.get('/healthz', (req, res) => {
  if (chaosMode === 'error') {
    return res.status(500).send('unhealthy');
  }
  res.status(200).send('healthy');
});

// Root endpoint for basic testing
app.get('/', (req, res) => {
  res.send(`Hello from ${appPool} - Release: ${releaseId}`);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`App (${appPool}) running on port ${port}`);
  console.log(`Release ID: ${releaseId}`);
});
