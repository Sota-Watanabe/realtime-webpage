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

previousVdom = convertHTML('<body></body>')
domVersion = 0
domStore = []

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

  socket.on('resetVdom', () => {
    console.log('resetVdom')
    previousVdom = convertHTML('<body></body>')
    domStore = []
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
