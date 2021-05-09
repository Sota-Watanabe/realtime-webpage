const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(express.static('public'));

const diff = require("virtual-dom/diff")
const Serializer = require('vdom-serialize');

const VNode = require('virtual-dom/vnode/vnode');
const VText = require('virtual-dom/vnode/vtext');

const convertHTML = require('html-to-vdom')({
  VNode: VNode,
  VText: VText
});

previousVdom = convertHTML('<body></body>')
domVersion = 0
domStore = []
let editingStatus = false

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/viewer', (req, res) => {
  res.sendFile(__dirname + '/public/viewer.html');
});
app.get('/editor', (req, res) => {
  res.sendFile(__dirname + '/public/editor.html');
});
app.post('/', (req, res) => {

  // wordpress用
  console.log(req.body.post.post_content)
  html = req.body.post.post_content
  html = html.replace(/<!--.+? -->/g, '')

  latestVdom = convertHTML('<body>' + html + '</body>')
  console.log('latestVdom=', latestVdom)
  const patches = diff(previousVdom, latestVdom);
  console.log('patches=', JSON.stringify(patches))
  // 変更なしの場合
  if (Object.keys(patches).length == 1) {
    console.log("patchの変更なし")
    return;
  }
  const serializedPatches = Serializer.serializePatches(patches);

  // ストアに追加
  domStore.push(latestVdom)
  console.log(html)
  const data = {
    vdom: serializedPatches,
    variable: null,
    domVersion: domStore.length
  };


  console.log(' - send! - ')
  io.sockets.emit('latestHtml', data);
  previousVdom = latestVdom
  res.send("Received POST Data!\n");
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (socket) => {
  let admin = false;
  console.log('a user connected');
  io.to(socket.id).emit('editingStatus', editingStatus);

  socket.on('startEditing', (status) => {
    editingStatus = true
    admin = true;
    console.log('receive status from editor', status)
    socket.broadcast.emit('editingStatus', true);
  });

  socket.on('disconnect', () => {
    if (admin === true){
      editingStatus = false
      // admin = false; なくてもいい
      socket.broadcast.emit('editingStatus', false);
    }
    console.log('user disconnected');
  });

  socket.on('resetVdom', () => {
    console.log('resetVdom')
    previousVdom = convertHTML('<body></body>')
    domStore = []
  });

  socket.on('onUpdateHtml', (html) => {
    latestVdom = convertHTML('<body>' + html + '</body>')
    const patches = diff(previousVdom, latestVdom);
    console.log('patches=', JSON.stringify(patches))
    // 変更なしの場合
    if (Object.keys(patches).length == 1) {
      console.log("patchの変更なし")
      return;
    }
    const serializedPatches = Serializer.serializePatches(patches);

    // ストアに追加
    domStore.push(latestVdom)
    console.log(html)
    const data = {
      vdom: serializedPatches,
      variable: null,
      domVersion: domStore.length
    };

    socket.broadcast.emit('latestHtml', data);
    console.log(' - send! - ')
    previousVdom = latestVdom
  });

  socket.on('checkDomVersion', (domVersion) => {
    latestDomVersion = domStore.length
    console.log('latest: domVersion=', latestDomVersion)
    // console.log('checkDomVersion: domVersion=', domVersion)
    // 最新のDOM状態ではない場合
    if (domStore.length !== domVersion) {
      console.log("update dom from current dom")
      // 初めてアクセスしたとき
      if(domVersion == 0) {
        console.log('first access')
        currentVdom = convertHTML('<body></body>')
      }
      // 途中で回線が落ちた場合
      else {
        currentVdom = domStore[domVersion - 1]
        // console.log("currentVdom:", currentVdom)
      }
      latestVdom = domStore.slice(-1)[0]
      // console.log("latestVdom:", latestVdom)
      const patches = diff(currentVdom, latestVdom);
      const serializedPatches = Serializer.serializePatches(patches);
      const data = {
        vdom: serializedPatches,
        variable: null,
        domVersion: domStore.length
      };
      io.to(socket.id).emit('latestHtml', data);
      console.log('io.to')
    }
  });
});
