const Serializer = require('vdom-serialize');
const h = require("virtual-dom/h")
const createElement = require("virtual-dom/create-element")
const socket = io();
const patch = require('virtual-dom/patch');

const article = h("article")
articleNode = createElement(article)
document.body.appendChild(articleNode)
let domVersion = 0

socket.on('connect', function () {
  socket.emit('checkDomVersion', domVersion);
});
socket.on("latestHtml", (data) => {
  console.log("received sync event", data.vdom);
  console.log("received domVersion", data.domVersion);
  domVersion = data.domVersion
  console.log('vdom=', data.vdom)
  var serialized = Serializer.deserializePatches(data.vdom);
  patch(articleNode, serialized);
});
