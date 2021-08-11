const setKey = function (vdom, vdomWithKey) {
    // console.log('vdomWithKey=', vdomWithKey)
    console.log('before vdom=', vdom)
    result = walk(vdom, vdomWithKey)
    if (result === true) {
        return true
    }

    for (child of vdom.children) {
        setKey(child, vdomWithKey)
    }

};

// target ...これを探す
// source ...keyあり、検索対象
function walk(target, source){
    // console.log('\n\nstart walk')
    // console.log('target=', target)
    // console.log('source.key=', source.key)
    if (isMatch(target, source)) {
        target.key = source.key
        target.properties = source.properties
        target.children = source.children
        console.log('match!!!')
        return true
    } else if (source.children === undefined) {
        // console.log('none...')
        return false
    }
    for (const child of source.children) {
        // console.log('\nvdom=', child)
        result = walk(target, child)
        if (result === true) return true
    }
}

function isMatch(target, source) {
    // 参照値渡しになってしまうのでコピー
    copiedSource = JSON.parse(JSON.stringify(source))
    setKeyUndefined(copiedSource)
    return JSON.stringify(target) === JSON.stringify(copiedSource)
}

function setKeyUndefined(vdom) {
    if ('key' in vdom) {
        vdom.key = undefined
        delete vdom.properties.key
    }
    if ('children' in vdom) {
        for (const child of vdom.children) {
            setKeyUndefined(child)
        }
    }
}


module.exports = setKey;