const http = require('http');

const server = http.createServer((req, res) => {
  const ipAddress = req.connection.remoteAddress;
  console.log(`User connected from ${ipAddress}`);

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, world!\n');
});

const port = 3000;
const host = '0.0.0.0'
server.listen(port, host, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
