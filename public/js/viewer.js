const Serializer = require('vdom-serialize');
const h = require("virtual-dom/h")
const createElement = require("virtual-dom/create-element")
const socket = io();
const patch = require('virtual-dom/patch');

const VNode = require('virtual-dom/vnode/vnode');
const VText = require('virtual-dom/vnode/vtext');
const expandMove = require('../../js/expandMove');
const expandVNode = require('../../js/expandVNode');

const _ = require('lodash')

const convertHTML = require('html-to-vdom')({
  VNode: VNode,
  VText: VText
});
const original = h("original")
originalNode = createElement(original)
document.body.appendChild(originalNode)
let domVersion = 0

socket.on('connect', function () {
  socket.emit('checkDomVersion', domVersion);
});

socket.on("latestHtml", (data) => {
  let tempVdom = _.cloneDeep(data.vdom);
  console.log("received patches =", tempVdom);
  console.log("received movesobj=", data.movesObj);
  console.log("received domVersion", data.domVersion);
  domVersion = data.domVersion
  var patches = Serializer.deserializePatches(data.vdom);
  const myDom = document.getElementsByTagName('original')[0].outerHTML
  myVdom = convertHTML(myDom)
  patches.a = myVdom
  const movesObj = data.movesObj
  expandMove(patches, movesObj, myVdom)
  // console.log('mydom=', myVdom)
  // console.log("expanded patches =", patches);
  expandVNode(patches, myVdom)
  console.log('patches=', patches)
  patch(originalNode, patches);
  console.log('end of patch')
});

