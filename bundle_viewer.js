(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var VNode = require('virtual-dom/vnode/vnode');
var VPatch = require('virtual-dom/vnode/vpatch');
var VText = require('virtual-dom/vnode/vtext');

module.exports.serializePatches = function(obj){

    obj = iterate(obj);
    return obj;
};

module.exports.deserializePatches = function(obj){

    for ( var prop in obj ){
        if ( obj.hasOwnProperty(prop)) {
            obj[prop] = createNode(obj[prop]);
        }
    }
    return obj;
};

function createNode(obj){
    var node = '';
    if ( obj['#type']) {
        if (obj['#type'] == 'VirtualPatch') {
            obj.patch = createNode(obj.patch);
            node = new VPatch(obj.type, obj.vNode, obj.patch);
            return node;
        }
        else if (obj['#type'] == 'VirtualText') {
            node = new VText(obj.text);
            return node;
        }
        else if (obj['#type'] == 'VirtualNode') {
            var children = [];
            for (var child in obj.children) {
                if ( obj.children.hasOwnProperty(child)) {
                    children.push(createNode(obj.children[child]))
                }
            }
            node = new VNode(obj.tagName, obj.properties, children);
            return node;
        }
    }
    else if (Array.isArray(obj)){
        var arr = [];
        for ( var i in obj ){
            if ( obj.hasOwnProperty(i)) {
                arr.push(createNode(obj[i]))
            }
        }
        obj = arr;
    }
    return obj;
}

function iterate(obj){
    for (var prop in obj ){
        if ( obj.hasOwnProperty(prop)) {
            if (Array.isArray(obj[prop])) {
                obj[prop] = iterate(obj[prop])
            }
            else {
                if (obj[prop] && obj[prop].constructor && (
                    obj[prop].constructor.name == 'VirtualNode' ||
                    obj[prop].constructor.name == 'VirtualPatch' ||
                    obj[prop].constructor.name == 'VirtualText')) {
                    console.log("found node: " + obj[prop].constructor.name);
                    obj[prop]['#type'] = obj[prop].constructor.name;
                    obj[prop] = iterate(obj[prop])
                }
            }
        }
    }

    return obj;
}
},{"virtual-dom/vnode/vnode":7,"virtual-dom/vnode/vpatch":8,"virtual-dom/vnode/vtext":9}],2:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],3:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],4:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":6}],5:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],6:[function(require,module,exports){
module.exports = "2"

},{}],7:[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-thunk":2,"./is-vhook":3,"./is-vnode":4,"./is-widget":5,"./version":6}],8:[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":6}],9:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":6}],10:[function(require,module,exports){
console.log('aabbba')

const Serializer = require('@zharktas/vdom-serialize');
const socket = io();
socket.on("broadcast", (data) => {
  console.log("received sync event", data);
  var serialized = Serializer.deserializePatches(data.vdom);
  patch(document.body, serialized);
});

},{"@zharktas/vdom-serialize":1}]},{},[10]);
