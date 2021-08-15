const setKey = require("./setkey")

const diff = require("virtual-dom/diff")
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
let withKey = fs.readFileSync("previous_with_key.html", 'utf-8')
vdomWithKey = convertHTML(normalize(withKey))
let latest = fs.readFileSync("latest.html", 'utf-8')
vdom = convertHTML(normalize(latest))
// console.log('helper_test.js: before vdom=', JSON.stringify(vdom, null, '\t'))
// setKey(vdom, vdomWithKey)
// console.log('helper_test.js: after vdom=', JSON.stringify(vdom, null, '\t'))
patch = diff(vdomWithKey, vdom)
console.log('helper_test.js: patch=', JSON.stringify(patch, null, '\t'))

function normalize (html) {
    html = html.replace(/\n/g, '')
    html = html.replace(/\t/g, '')
    return html
}