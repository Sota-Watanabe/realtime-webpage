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

const deleteVNode = require('./js/deletevnode')

let convertHTML = require('html-to-vdom')({
  VNode: VNode,
  VText: VText
});

convertHTML = convertHTML.bind(null, {
  getVNodeKey: function (attributes) {
    return attributes.key;
  }
});

const Diff = require('diff')

let previousVdom = convertHTML('<original></original>')
let previousHTML = ""
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
  // console.log('latestVdom=', latestVdom)
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
  // console.log('listening on *:3000');
});

io.on('connection', (socket) => {
  let admin = false;
  // socket.broadcast.emit('Hello');
  // console.log('a user connected');
  // console.log("suggestData, virtualData, reloadData")
  // io.to(socket.id).emit('editingStatus', editingStatus);

  socket.on('`start`Editing', (status) => {
    // editingStatus = true
    admin = true;
    console.log('receive status from editor', status)
    // socket.broadcast.emit('editingStatus', true);
  });

  socket.on('disconnect', () => {
    if (admin === true) {
      editingStatus = false
      // admin = false; なくてもいい
      // socket.broadcast.emit('editingStatus', false);
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
    // console.log(html)
    html = html.replace(/\r?\n/g,"")
    // console.log(html)
    latestVdom = convertHTML('<original>' + html + '</original>')
    // キーなしVdomを比較するためtempしておく
    let tempVdom = _.cloneDeep(latestVdom);

    let virtualLatest = _.cloneDeep(latestVdom);
    let suggestLatest = _.cloneDeep(latestVdom);

    // let reloadprevious = _.cloneDeep(previousVdom); reloadLatestのデータ量のみ計測なので不要
    let virtualPrevious = _.cloneDeep(previousVdom);
    let suggestPrevious = _.cloneDeep(previousVdom);

    // setKey(suggestPrevious, suggestLatest)
    // console.log('suggestprevious=', JSON.stringify(suggestprevious))
    // console.log('virtualprevious=', JSON.stringify(virtualprevious))

    let patches = {}
    virtualPatches = diff(virtualPrevious, virtualLatest);
    suggestPatches = diff(suggestPrevious, suggestLatest);
    // 次の呼び出しの備え、previousを更新
    previousVdom = tempVdom

    // if (Object.keys(patches).length == 1) {
    //   console.log("patchの変更なし")
    //   return;
    // }

    // movesObjの作成
    // suggestMovesObj = setMove(suggestPatches)
    suggestMovesObj = {}
    // vNodeの削除
    deleteVNode(suggestPatches)
    delete suggestPatches.a
    // console.log("\n\nsuggestPatches=", JSON.stringify(suggestPatches))

    const suggestSerializedPatches = Serializer.serializePatches(suggestPatches);
    const virtualSerializedPatches = Serializer.serializePatches(virtualPatches);
    // aを削除
    delete suggestSerializedPatches.a


    // ストアに追加
    // domStore.push(latestVdom)
    const suggestData = {
      movesObj: suggestMovesObj,
      vdom: suggestSerializedPatches,
      variable: null,
      domVersion: domStore.length
    };

    const virtualData = {
      movesObj: null,
      vdom: virtualSerializedPatches,
      variable: null,
      domVersion: domStore.length
    }

    const reloadData = {
      rawHtml: '<original>' + html + '</original>'
    }

    diffHTMLData = ""
    // console.log('start of diffHTML')
    // diffHTMLData = diffHTML(previousHTML, html)
    // console.log('end of diffHTML')
    previousHTML = html
    // console.log(JSON.stringify(suggestData))
    // console.log(JSON.stringify(suggestData))
    // console.log(JSON.stringify(reloadData))
    console.log(memorySizeOf(suggestData),",",memorySizeOf(virtualData),",",memorySizeOf(reloadData))
    // console.log(memorySizeOf(suggestData),",",memorySizeOf(virtualData),",",memorySizeOf(reloadData), memorySizeOf(diffHTMLData))
  });

  socket.on('checkDomVersion', (domVersion) => {
    latestDomVersion = domStore.length
    console.log('latest: domVersion=', latestDomVersion)
    // console.log('checkDomVersion: domVersion=', domVersion)
    // 最新のDOM状態ではない場合
    if (domStore.length !== domVersion) {
      console.log("update dom from current dom")
      // 初めてアクセスしたとき
      if (domVersion == 0) {
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

function diffHTML(previousHTML, html) {
  const diffObj = Diff.diffChars(previousHTML, html)
  console.log(diffObj)
  for (obj of diffObj){
    console.log(obj["added"])
    if ((obj["added"] == true )|| (obj["added"] == true)){
      return obj.value
    }
  }
  return ''
}

function memorySizeOf(obj) {
  var bytes = 0;

  function sizeOf(obj) {
      if(obj !== null && obj !== undefined) {
          switch(typeof obj) {
          case 'number':
              bytes += 8;
              break;
          case 'string':
              bytes += obj.length * 2;
              break;
          case 'boolean':
              bytes += 4;
              break;
          case 'object':
              var objClass = Object.prototype.toString.call(obj).slice(8, -1);
              if(objClass === 'Object' || objClass === 'Array') {
                  for(var key in obj) {
                      if(!obj.hasOwnProperty(key)) continue;
                      sizeOf(obj[key]);
                  }
              } else bytes += obj.toString().length * 2;
              break;
          }
      }
      return bytes;
  };

  function formatByteSize(bytes) {
      if(bytes < 1024) return bytes + " bytes";
      else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KiB";
      else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MiB";
      else return(bytes / 1073741824).toFixed(3) + " GiB";
  };

  return formatByteSize(sizeOf(obj));
};