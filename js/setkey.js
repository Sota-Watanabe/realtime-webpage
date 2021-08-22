const setKey = function (target, source) {
    // checkOnlyChangeText(target, source)
    setMatchVNode(target, source)
    // setSimilarVNode(target, source)
};

function checkOnlyChangeText(target, source) {
    checkSameLocation(target, source)

}

function checkSameLocation(target, source) {
    copiedTarget = JSON.parse(JSON.stringify(target))
    copiedSource = JSON.parse(JSON.stringify(source))
    // keyを削除
    if (copiedSource.key !== undefined) {
        delete copiedSource.key
        delete copiedSource.properties.key
    }
    delete copiedTarget.children
    delete copiedSource.children
    if (JSON.stringify(copiedTarget) === JSON.stringify(copiedSource)) {
        console.log('children 以外は一致')
        if (target.children.length === source.children.length) {

        }
        for (child of target.children) {

        }
        checkSameLocation()
    }

}


function setSimilarVNode(target, source) {
    if (target.key !== undefined) return
    console.log('移動元親の可能性あり')
    childrenKeys = getChildrenKeys(target)

    for (childkey of childrenKeys) {
        parentInfo = getParentKey(childkey, source)


    }

    console.log('targetKeys=', getChildrenKeys(target))
    console.log('sourceKeys=', getChildrenKeys(source))

}

// targetがなかった場合、そのchildrenをsetMatchVNodeする関数
function setMatchVNode(target, source) {
    index = -1
    result = walk(target, source)
    if (result === true) {
        // 個要素も同じなのでやる必要なし
        return true
    }else if(target.children === undefined) {
        return false
    }
    for (child of target.children) {
        setMatchVNode(child, source)
    }
}

function getDiffs(a, b) {
    if (a.length < b.length) {
        [a, b] = [b, a]
    }
    diffs = a.filter(i => b.indexOf(i) == -1)
    return diffs
}

function getChildrenKeys(tree) {
    keys = []
    if (tree.children === undefined) return keys
    for (child of tree.children) {
        if(child.key === undefined) continue
        keys.push(child.key)
    }
    return keys
}

// target ...これを探す
// source ...keyあり、検索対象
function walk(target, source){
    index = Math.random().toString(32).substring(2)
    // console.log('walk: index=', index)
    // console.log('target=', target)
    // console.log('source.key=', source.key)
    if (isMatch(target, source)) {
        // console.log('match!!!!!')
        // console.log('target=', target)
        // console.log('source=', source)
        // console.log('target==', index)
        target.key = index
        source.key = index
        if (target.properties != undefined) {
            target.properties['key'] = index
            source.properties['key'] = index
        }
        return true
    } else if (source.children === undefined) {
        // console.log('none...')
        return false
    }
    for (const child of source.children) {
        result = walk(target, child)
        if (result === true) return true
    }
}

function isMatch(target, source) {
    // 参照値渡しになってしまうのでコピー
    copiedSource = JSON.parse(JSON.stringify(source))
    // setKeyUndefined(copiedSource)
    return JSON.stringify(target) === JSON.stringify(copiedSource)
}

function setKeyUndefined(target) {
    if ('key' in target) {
        target.key = undefined
        delete target.properties.key
    }
    if ('children' in target) {
        for (const child of target.children) {
            setKeyUndefined(child)
        }
    }
}


module.exports = setKey;