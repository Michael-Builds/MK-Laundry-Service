const http = require('http');
const fs = require('fs');
const path = require('path');
const { getState, saveState } = require('./db');

const requestedPort = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';
const root = __dirname;
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

const server = http.createServer((request, response) => {
  if (request.url === '/api/state' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(getState()));
    return;
  }
  if (request.url === '/api/state' && request.method === 'POST') {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      try {
        saveState(JSON.parse(body));
        response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ ok: true }));
      } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ error: 'Invalid application data' }));
      }
    });
    return;
  }
  const requestedPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const filePath = path.normalize(path.join(root, requestedPath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500);
      response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    response.end(content);
  });
});

const ready = new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(requestedPort, host, () => {
    const address = server.address();
    const actualPort = typeof address === 'object' && address ? address.port : requestedPort;
    console.log(`MK Laundry Service is running on port ${actualPort}`);
    resolve(actualPort);
  });
});

module.exports = { server, ready };
