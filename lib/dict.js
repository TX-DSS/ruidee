dict = {
    taskStatus: {
        '0': '已无效',
        '1': '待发布',
        '2': '待领取',
        '3': '进行中',
        '4': '已完成',
    }
}
exports.get = function(dictname, key) {
    if ( dict[dictname] && dict[dictname][key] ) {
        return dict[dictname][key];
    } else {
        return '';
    }
}
exports.transCollection = function(target, name, dictname) {
    var result = [];
    if (!dict[dictname]) return;
    for ( var i=0,l=target.length; i<l; i++ ) {
        var key = target[i][name];
        var obj = target[i].toObject();
        if ( dict[dictname][key] ) {
            var alinm = name + '_desc';
            obj[alinm] = dict[dictname][key];
            console.log(obj);
        }
        result.push(obj);
    }
    return result;
    //console.log(target);
}
