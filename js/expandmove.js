const VPatch = require("virtual-dom/vnode/vpatch")
var isArray = require("x-is-array")

let index
const expandMove = function (patches, movesObj, vdom) {
    // console.log('expandMove: patches=', JSON.stringify(patches, null, '\t'))
    // console.log('expandMove: movesObj=', JSON.stringify(movesObj, null, '\t'))
    for (moveKey in movesObj) {
        const vNum = movesObj[moveKey].before
        const vnode = getVnode(vNum, vdom)
        apply = patches[movesObj[moveKey].after]
        patch = appendPatch(apply, new VPatch(VPatch.INSERT, null, vnode))
        patches[movesObj[moveKey].after] = patch

        apply = patches[movesObj[moveKey].before]
        patch = appendPatch(apply, new VPatch(VPatch.REMOVE, vnode, null))
        patches[movesObj[moveKey].before] = patch
    }
    // console.log('expandMove: patches=', JSON.stringify(patches, null, '\t'))
};


function getVnode(vNum, vdom) {
    index = -1
    return walk(vdom, vNum)
}

function walk(tree, vNum) {
    index++
    if (index == vNum) {
        return tree
    } else if (tree.children === undefined) {
        return
    }
    for (child of tree.children) {
        const result = walk(child, vNum)
        if (result !== undefined) {
            return result
        }
    }

}

// diff.js から引用
function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.unshift(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

module.exports = expandMove;