movesObj = {}
const insert = 6
const remove = 7

const setMove = function (patches) {
    movesObj = {} // 初期化
    getMovesObj(patches)
    return movesObj
}

const getMovesObj = function (patches) {


    for (const nNum in patches) {
        // 配列の場合は自身をもう一度呼ぶ (別に再帰である必要はない)
        if (Array.isArray(patches[nNum])){
            for (patch of patches[nNum]) {
                const obj = {}
                obj[nNum] = patch
                getMovesObj(obj)
            }
        }
        const type = patches[nNum].type
        key = getKey(patches[nNum])
        if (key !== undefined) {
            setMoveList(key, nNum, type, patches)
        }
    }
    return movesObj
};

function getKey(patch) {
    const type = patch.type
    key = undefined
    if (type === insert) {
        key = patch['patch'].key
    } else if (type === remove) {
        key = patch['vNode'].key
    }
    return key
}

function deleteMovePatch(patches) {
    for (const moveKey in movesObj) {
        if (movesObj[moveKey]['before'] && movesObj[moveKey]['after']) {
            // console.log('moveKey=', moveKey)
            // console.log('patches=', patches)
            for (const nNum in patches) {
                if (Array.isArray(patches[nNum])){
                    let i = 0
                    for (patch of patches[nNum]) {
                        const key = getKey(patch)
                        if (moveKey == key) {
                            patches[nNum].splice(i, 1)
                        }
                        i++
                    }
                }
                if (isMovedPatch(patches[nNum], moveKey)) {
                    delete patches[nNum]
                    // console.log('after patches=', patches)
                }
            }
        }
    }
}

function isMovedPatch(patch, key) {
    patchKey = getKey(patch)
    if (patchKey == key) return true
    return false
}


function setMoveList(key, nNum, type, patches) {
    if (movesObj[key]) { // 前のがある
        // console.log(movesObj[key])
        if (type === insert) {
            movesObj[key].after = nNum
        } else {
            movesObj[key].before = nNum
        }
        deleteMovePatch(patches)
    } else {
        if (type === insert) {
            movesObj[key] = { after: nNum}
        } else { // remove
            movesObj[key] = { before: nNum}
        }
    }
}


module.exports = setMove;