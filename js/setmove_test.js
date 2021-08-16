const setMove = require("./setmove")

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
let previous = fs.readFileSync("previous_with_key.html", 'utf-8')
previous = convertHTML(normalize(previous))
let latest = fs.readFileSync("latest.html", 'utf-8')
latest = convertHTML(normalize(latest))
patches = diff(previous, latest)
delete patches.a
movesObj = setMove(patches)
console.log('movesObj=', movesObj)
console.log('patches=', JSON.stringify(patches, null, '\t'))

function normalize (html) {
    html = html.replace(/\n/g, '')
    html = html.replace(/\t/g, '')
    return html
}