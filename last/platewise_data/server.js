const http = require('http');
const fs = require('fs');
const path = require('path');
const { signUp, signIn, savePlan, readDatabase } = require('./auth');

const root = path.join(__dirname, '..');
const publicRoot = root;

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('error', reject);
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8').trim();
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/signup' && req.method === 'POST') {
    readJsonBody(req)
      .then(payload => {
        const result = signUp(payload.name, payload.email, payload.password);
        res.writeHead(result.ok ? 201 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      })
      .catch(err => {
        console.error('signup route error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: err.message || 'Server error' }));
      });
    return;
  }

  if (url.pathname === '/api/signin' && req.method === 'POST') {
    readJsonBody(req)
      .then(payload => {
        const result = signIn(payload.email, payload.password);
        res.writeHead(result.ok ? 200 : 401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      })
      .catch(err => {
        console.error('signin route error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: err.message || 'Server error' }));
      });
    return;
  }

  if (url.pathname === '/api/save-plan' && req.method === 'POST') {
    readJsonBody(req)
      .then(payload => {
        const result = savePlan(payload.email, payload.goal, payload.meals);
        res.writeHead(result.ok ? 201 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      })
      .catch(err => {
        console.error('save-plan route error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: err.message || 'Server error' }));
      });
    return;
  }

  if (url.pathname === '/api/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(readDatabase().users));
    return;
  }

  if (url.pathname === '/api/meal-library') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(readDatabase().mealLibrary));
    return;
  }

  const requested = url.pathname === '/' ? '/Platewise/polita.html' : url.pathname;
  const requestedFile = path.normalize(path.join(publicRoot, requested));

  if (!requestedFile.startsWith(publicRoot)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()) {
    const ext = path.extname(requestedFile);
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };

    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(fs.readFileSync(requestedFile));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(8080, () => {
  console.log('PlateWise API running at http://127.0.0.1:8080');
});
