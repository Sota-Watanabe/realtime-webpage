const deleteVNode = function (patches) {

    deleteVNodeObj(patches)
    return
}

const deleteVNodeObj = function (patches) {


    for (const nNum in patches) {
        // 配列の場合は自身をもう一度呼ぶ (別に再帰である必要はない)
        if (Array.isArray(patches[nNum])){
            for (patch of patches[nNum]) {
                const obj = {}
                obj[nNum] = patch
                deleteVNodeObj(obj)
            }
        }
        if (patches[nNum].type == 5) {
            patches[nNum].vNode = 'omit'
        }
    }
    return
};


module.exports = deleteVNode;