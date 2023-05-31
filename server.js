const http = require('http');
const fs = require('fs');

// Read the HTML file for the chat room page
const chatRoomPage = fs.readFileSync('chatroom.html', 'utf8');

// Create an array to store the chat messages
const chatMessages = [];

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    // Serve the chat room page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(chatRoomPage);
  } else if (req.url === '/messages') {
    // Handle incoming messages
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        const message = decodeURIComponent(body);
        chatMessages.push(message);
        // Broadcast the new message to all connected clients
        broadcastMessage(message);
        res.end();
      });
    } else if (req.method === 'GET') {
      // Return the chat messages as JSON
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(chatMessages));
    }
  } else {
    // Handle invalid URLs
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const port = 3000;
const host = '0.0.0.0'
server.listen(port, host, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// WebSocket implementation for real-time communication
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('New user connected');

  ws.on('message', message => {
    console.log(`Received message: ${message}`);
    chatMessages.push(message);
    // Broadcast the new message to all connected clients, including the sender
    broadcastMessage(message);
  });

  ws.on('close', () => {
    console.log('User disconnected');
  });
});

function broadcastMessage(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
