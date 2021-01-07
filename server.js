const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const diff = require("virtual-dom/diff")
const Serializer = require('@zharktas/vdom-serialize');

const VNode = require('virtual-dom/vnode/vnode');
const VText = require('virtual-dom/vnode/vtext');

const convertHTML = require('html-to-vdom')({
  VNode: VNode,
  VText: VText
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/viewer', (req, res) => {
  res.sendFile(__dirname + '/viewer.html');
});
app.get('/editor', (req, res) => {
  res.sendFile(__dirname + '/editor.html');
});
app.get('/bundle_viewer.js', (req, res) => {
  res.sendFile(__dirname + '/bundle_viewer.js');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('onUpdateHtml', (html) => {
    console.log('receive', html);
    latestVdom = convertHTML(html)
    initialState = convertHTML('<body></body>')
    var patches = diff(initialState, latestVdom);
console.log(JSON.stringify(patches))
    var serializedPatches = Serializer.serializePatches(patches);
    // var variables = variableInstance.serialize();
    console.log('serializedPatches=', JSON.stringify(serializedPatches))

    var data = {
      vdom: serializedPatches,
      variable: null
    };

    socket.broadcast.emit('latestHtml', data);
    console.log(' - send! - ')

  });
});
