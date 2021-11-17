const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.send('Hello！');
});


http.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (socket) => {
  console.log('connect: ',socket.client.conn.server.clientsCount);
  socket.on('disconnect', () => {
    console.log('disconnect: ',socket.client.conn.server.clientsCount);
  });
});