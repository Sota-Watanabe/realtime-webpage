let index
const expandVNode = function (patches, myVdom) {
    expandVNodeObj(patches, myVdom)
    return
}

const expandVNodeObj = function (patches, myVdom) {

    for (nNum in patches) {
        // console.log('patch=', patches[nNum])
        if (Array.isArray(patches[nNum])){
            for (p of patches[nNum]) {
                const obj = {}
                obj[nNum] = p
                expandVNodeObj(obj, myVdom)
            }
        }
        if (patches[nNum].type == 5) {
            vNode = searchVNode(nNum, myVdom)
            console.log('---expandVNode----')
            // console.log('nNum=', nNum)
            console.log('vNode=', vNode)
            // patches[nNum].vNode = vNode
        }

    }
};

function searchVNode(nNum, tree){
    index = -1
    vNode = walk(tree, nNum)
    return vNode
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

module.exports = expandVNode;