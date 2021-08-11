const setKey = require("./helper")

const VNode = require('virtual-dom/vnode/vnode');
const VText = require('virtual-dom/vnode/vtext');
let convertHTML = require('html-to-vdom')({
    VNode: VNode,
    VText: VText
});
convertHTML = convertHTML.bind(null, {
    getVNodeKey: function (attributes) {
        return attributes.key;
    }
});

const fs = require('fs');
let withKey = fs.readFileSync("with_key.html", 'utf-8')

withKey = withKey.replace(/\n/g, '')
withKey = withKey.replace(/\t/g, '')
vdomWithKey = convertHTML(withKey)
vdom = convertHTML('<p> p tag one</p>')
setKey(vdom, vdomWithKey)