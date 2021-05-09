const Serializer = require('vdom-serialize');
const diff = require("virtual-dom/diff")
const h = require("virtual-dom/h")
const createElement = require("virtual-dom/create-element")
const patch = require('virtual-dom/patch');

const VNode = require('virtual-dom/vnode/vnode');
const VText = require('virtual-dom/vnode/vtext');
const convertHTML = require('html-to-vdom')({
    VNode: VNode,
    VText: VText
});

const socket = io.connect();

socket.on('connect', function () {
    socket.emit('startEditing');
});

const article = h("article")
articleNode = createElement(article)

window.updateTextarea = () => {
    console.log('start updateTextarea')
    let html = document.getElementById('text').value
    html = html.replace(/\n/g, '')
    html = html.replace(/\t/g, '')
    html = html.replace(/<!-- .*? -->/, '')// <!-- -->はノードがundefinedになるので削除
    console.log('html=', html)
    if (checkHTML(html) == true) {
        socket.emit("onUpdateHtml", html);
        console.log("emit html");
        // e.preventDefault();
    }
}

const checkHTML = (html) => {
    currentVdom = convertHTML('<body>' + html + '</body>')
    const initVdom = convertHTML('<body></body>')
    const patches = diff(initVdom, currentVdom);
    const serializedPatches = Serializer.serializePatches(patches);
    const serialized = Serializer.deserializePatches(serializedPatches);

    try {
        patch(articleNode, serialized);
    } catch (error) {
        console.log(error.message); // => "例外が投げられました"
        return false
    }
    return true
}

window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = '';
  });
