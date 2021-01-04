const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cron = require('node-cron');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

cron.schedule('*/5 * * * * *', () => {
  console.log('send hello.');
  io.emit('message', 'hello');
});
