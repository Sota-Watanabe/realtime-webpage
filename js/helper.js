const setKey = function (vdom, vdomWithKey) {
    // console.log('vdomWithKey=', vdomWithKey)
    console.log('vdom=', vdom)
    result = walk(vdom, vdomWithKey)
    if (result === undefined) {
        console.log('not set key')
        return vdom
    } else {
        console.log('set key')
        return result
    }
};

// target ...これを探す
// source ...keyあり、検索対象
function walk(target, source){
    // console.log('\n\nstart walk')
    // console.log('target=', target)
    // console.log('source.key=', source.key)
    if (isMatch(target, source)) {
        return source
    } else if (source.children === undefined) {
        // console.log('none...')
        return
    }
    for (const child of source.children) {
        // console.log('\nvdom=', child)
        result = walk(target, child)
        if (result != undefined) return result
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