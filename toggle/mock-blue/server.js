const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

let chaosMode = false;

app.get('/version', (req, res) => {
  if (chaosMode) {
    return res.status(500).json({ error: 'Chaos mode active' });
  }
  
  res.set({
    'X-App-Pool': 'blue',
    'X-Release-Id': process.env.RELEASE_ID || 'blue-mock-1.0'
  });
  
  res.json({ 
    version: '1.0.0',
    pool: 'blue',
    release: process.env.RELEASE_ID || 'blue-mock-1.0'
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.post('/chaos/start', (req, res) => {
  chaosMode = true;
  res.json({ status: 'Chaos started', mode: 'error' });
});

app.post('/chaos/stop', (req, res) => {
  chaosMode = false;
  res.json({ status: 'Chaos stopped' });
});

app.listen(port, () => {
  console.log(`Mock Blue app running on port ${port}`);
});
