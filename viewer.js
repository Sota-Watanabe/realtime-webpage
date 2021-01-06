const Serializer = require('@zharktas/vdom-serialize');
const socket = io();
var patch = require('virtual-dom/patch');
socket.on("broadcast", (data) => {
  console.log("received sync event", data.vdom);
  var serialized = Serializer.deserializePatches(data.vdom);
  patch(document.body, serialized);
});
