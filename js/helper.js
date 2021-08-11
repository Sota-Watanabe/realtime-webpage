const setKey = function (vdom, vdomWithKey) {
    console.log('vdomWithKey=', vdomWithKey)
    console.log('vdom=', vdom)
    result = walk(vdom, vdomWithKey)
    console.log('result=', result)

    return { beforeVdom: 'aaa', afterVdom: 'bbbb'};
};
// target ...これを探す
// source ...keyあり、検索対象
function walk(target, source){
    console.log('\n\nstart walk')
    console.log('target=', target)
    console.log('source=', source)
    if (JSON.stringify(target)  == JSON.stringify(source)) {
        console.log('match!!!')
        return 'match'
    } else if (source.children === undefined) {
        console.log('none...')
        return
    }
    for (const child of source.children) {
        console.log('\nvdom=', child)
        result = walk(target, child)
        if(result != undefined) {
            return 'match'
        }
    }
}

function matchChildren(target, source) {

}

function diffChildren(a, b, patch, apply, index) {
    // console.log('----diffChildren-----')
    // console.log('diffChildren: patch =', patch)
    // console.log('diffChildren: apply =', apply)
    var aChildren = a.children
    var orderedSet = reorder(aChildren, b.children)
    // console.log('diffChildren: orderedset=', orderedSet)
    var bChildren = orderedSet.children
    // console.log('diffChildren: bChildren=', bChildren)
    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    // console.log('diffChildern: before for')
    for (var i = 0; i < len; i++) {
        // console.log('diffChildern: for')
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        // console.log('diffChildren: leftNode=', leftNode)
        // console.log('diffChildren: rightNode=', rightNode)
        index += 1

        if (!leftNode) {
            // VPatch.MOVEの可能性 <---
            // 最後の子が移動した場合
            // どこから来たか
            if (rightNode) {
               // console.log('diffChildren: appendPatch')
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
           // console.log('diffChildren: walk')
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }
    // console.log('diffChildern: after for')

    if (orderedSet.moves) {
       // console.log('orderedSet.moves')
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(
            VPatch.ORDER,
            a,
            orderedSet.moves
        ))
    }

    return apply
}

module.exports = setKey;