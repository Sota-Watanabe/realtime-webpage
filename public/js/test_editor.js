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

let files
let file_index = 0
let max_file_index = 0
window.addEventListener('DOMContentLoaded', function () {
    document.getElementById('file').addEventListener('change', ev => {
        files = ev.target.files
        console.log(files)

        files = Object.keys(files).map(function (key) {
            return files[key];
        }).sort(function (a, b) {
            return (a.name < b.name) ? -1 : 1;  //オブジェクトの昇順ソート
        });
        max_file_index = ev.target.files.length
        document.getElementById("push_button").style.display ="block";    console.log(files)
    })
    document.getElementById("push_button").style.display = "none";
});

window.pushedEvent = () => {
    if (file_index === max_file_index) return
    document.getElementById('file_index').innerHTML = (file_index + 1) + "つ目のファイルを送信しました。"
    let file = files[file_index];
    // ディレクトリの相対パス
    let relativePath = file.webkitRelativePath;

    // ここではテキストファイルとして読み出してみる.
    let fileReader = new FileReader();
    fileReader.onload = event => {

        // 内容を取得する.
        let text = event.target.result;
        sendHTML(text)
        // 表示してみる.
        console.log(relativePath);
    }
    fileReader.readAsText(file);
    file_index++
}


const sendHTML = (html) => {
    console.log('start sendHTML')
    html = html.replace(/\n/g, '')
    html = html.replace(/\t/g, '')
    html = html.replace(/<!--.*?-->/g, '')// <!-- -->はノードがundefinedになるので削除
    html = html.replace(/<style.*?style>/g, '')// <!-- -->はノードがundefinedになるので削除
    html = html.replace(/<script.*?script>/g, '')// <!-- -->はノードがundefinedになるので削除
    console.log('html=', html)
    if (checkHTML(html) == true) {
        socket.emit("onUpdateHtml", html);
        console.log("emit html");
    }
}

const article = h("article")
articleNode = createElement(article)
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
