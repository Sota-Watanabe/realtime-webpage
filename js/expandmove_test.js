const expandMove = require("./expandmove")
const setMove = require("./setmove")
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
let previous = fs.readFileSync("previous_with_key.html", 'utf-8')
previous = convertHTML(normalize(previous))
let latest = fs.readFileSync("latest.html", 'utf-8')
latest = convertHTML(normalize(latest))
setKey(previous, latest)
patches = diff(previous, latest)
// console.log('root: patches=', JSON.stringify(patches, null, '\t'))
copiedpatches = {...patches}
delete patches.a
movesObj = setMove(patches)
// console.log('moveObj=', JSON.stringify(movesObj, null, '\t'))
// console.log('patches=', JSON.stringify(patches, null, '\t'))

// send movesObj & patches -------------

const myvdom = convertHTML(normalize(fs.readFileSync("previous_with_key.html", 'utf-8')))

expandMove(patches, movesObj, myvdom)
patches.a = myvdom

console.log(JSON.stringify(copiedpatches, null, '\t'))
console.log(JSON.stringify(patches))

// console.log('ok? ', JSON.stringify(copiedpatches) == JSON.stringify(patches))


function normalize (html) {
    html = html.replace(/\n/g, '')
    html = html.replace(/\t/g, '')
    return html
}