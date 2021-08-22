const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(express.static('public'));

const _ = require('lodash')

const diff = require("virtual-dom/diff")
const Serializer = require('vdom-serialize');
const setKey = require('./js/setkey')

const VNode = require('virtual-dom/vnode/vnode');
const VText = require('virtual-dom/vnode/vtext');
const setMove = require('./js/setmove');

let convertHTML = require('html-to-vdom')({
  VNode: VNode,
  VText: VText
});

convertHTML = convertHTML.bind(null, {
  getVNodeKey: function (attributes) {
    return attributes.key;
  }
});
let previousVdom = convertHTML('<original></original>')
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

  latestVdom = convertHTML('<original>' + html + '</original>')
  console.log('latestVdom=', latestVdom)
  const patches = diff(previousVdom, latestVdom);
  // console.log('patches=', JSON.stringify(patches))
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
    // 自作editor用

    latestVdom = convertHTML('<original>' + html + '</original>')
    // キーなしVdomを比較するためtempしておく
    let tempVdom = _.cloneDeep(latestVdom);
    setKey(previousVdom, latestVdom)

    const patches = diff(previousVdom, latestVdom);
    // console.log('patches=', JSON.stringify(patches))
    // 変更なしの場合

    // 次の呼び出しの備え、previousを更新
    previousVdom = tempVdom

    if (Object.keys(patches).length == 1) {
      console.log("patchの変更なし")
      return;
    }
    const serializedPatches = Serializer.serializePatches(_.cloneDeep(patches));
    delete serializedPatches.a

    // movesObjの作成
    movesObj = setMove(patches)


    // ストアに追加
    domStore.push(latestVdom)
    const data = {
      movesObj: movesObj,
      vdom: serializedPatches,
      variable: null,
      domVersion: domStore.length
    };
    socket.broadcast.emit('latestHtml', data);
    console.log('↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓')
    console.log(JSON.stringify(data, null, '\t'))
    console.log('↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑')
    console.log(' - send! - \n\n\n')
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
