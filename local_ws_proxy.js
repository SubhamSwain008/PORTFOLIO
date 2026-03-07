const net = require('net');
const WebSocket = require('ws');

const LOCAL_PORT = 54320;
const WS_URL = 'wss://ep-quiet-scene-aitufoy0.c-4.us-east-1.aws.neon.tech/v2'; // Neon postgres over WS endpoint

console.log(`Starting proxy from localhost:${LOCAL_PORT} to ${WS_URL}`);

const server = net.createServer((socket) => {
  console.log('Received connection, connecting to WS...');
  const ws = new WebSocket(WS_URL);
  
  ws.on('open', () => {
    console.log('WS connection established, tunneling data...');
    socket.on('data', data => ws.send(data));
    ws.on('message', data => socket.write(data));
  });

  ws.on('close', () => { console.log('WS closed'); socket.end(); });
  socket.on('close', () => { console.log('Socket closed'); ws.close(); });
  ws.on('error', err => { console.error('WS Error:', err.message); socket.end(); });
  socket.on('error', err => { console.error('Socket Error:', err.message); ws.close(); });
});

server.listen(LOCAL_PORT, () => {
  console.log(`Proxy listening on port ${LOCAL_PORT}`);
});
