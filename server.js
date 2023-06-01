const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const chatRoomPage = fs.readFileSync('chatroom.html', 'utf8');

const chatMessages = [];

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(chatRoomPage);
  } else if (req.url === '/messages') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        const message = decodeURIComponent(body);
        chatMessages.push(message);
        broadcastMessage(JSON.stringify(message)); // Convert message to string before broadcasting
        res.end();
      });
    } else if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(chatMessages));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('New user connected');

  ws.on('message', message => {
    console.log(`Received message: ${message}`);
    chatMessages.push(message);
    broadcastMessage(JSON.stringify(message)); // Convert message to string before broadcasting
  });

  ws.on('close', () => {
    console.log('User disconnected');
  });
});

function broadcastMessage(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

