const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/editor', (req, res) => {
  res.sendFile(__dirname + '/editor.html');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('onSendHtml', (msg) => {
    console.log('receive', msg);
    socket.broadcast.emit('broadcast', msg);
    console.log('send')

  });
});
