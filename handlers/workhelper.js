var Q = require('q');
var UserAccount = require('../models/user_account.js');
var TaskRecord = require('../models/task_record.js');
var dict = require('../lib/dict.js');

function insertTaskRecord(item, ignErr) {
    var deferred = Q.defer();

    console.log("save:");
    console.log(item);

    var taskData = new TaskRecord({
        cloneTaskId: item.cloneTaskId,
        summary: item.summary,
        tags: item.tags,
        detail: item.detail,
        docUrl: item.docUrl,
        planCompleteDate: item.planCompleteDate,
        remark: item.remark,
        deployer: item.deployer,
        accepter: item.accepter,
        scale: item.scale
    });
    taskData.save(function(err, result) {
        if (err) {
            if ( ignErr ) {
                deferred.resolve(false);
            } else {
                deferred.reject(err);
            }
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
}

function updateTaskRecord(item) {
    var deferred = Q.defer();

    console.log("update:");
    console.log(item);

    if ( !item._id ) deferred.reject('Error request param!');

    TaskRecord.findByIdAndUpdate(item._id, {
        summary: item.summary,
        tags: item.tags,
        detail: item.detail,
        docUrl: item.docUrl,
        remark: item.remark,
        planCompleteDate: item.planCompleteDate,
        handoverContent: item.handoverContent,
        accepter: item.accepter,
        complete: item.complete,
        status: item.status,
        scale: item.scale,
        publishDate: item.publishDate,
        acceptDate: item.acceptDate,
        completeDate: item.completeDate
    }, function(err, result){
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });

    return deferred.promise;
}

function queryTaskRecord(condition) {
    var deferred = Q.defer();

    var query = TaskRecord.find();
    // 任务编号
    if (condition.taskId) {
        query.where('taskId').equals(condition.taskId);
    }

    // 任务标题(默认模糊匹配)
    if (condition.summary) {
        var qr = new RegExp(condition.summary);
        query.where('summary').equals(qr);
    }

    // 任务标签(默认且关系)
    if (condition.tags) {
        var tagsArray = condition.tags.split(', ');
        var qr = new RegExp(tagsArray.join('[\\s\\S]*'));
        query.where('tags').equals(qr);
    }

    // 发布时间
    if (condition.publishDate_start) {
        query.where('publishDate').gte(condition.publishDate_start);
    }
    if (condition.publishDate_end) {
        query.where('publishDate').lt(condition.publishDate_end);
    }

    // 发布人
    if (condition.deployer) {
        query.where('deployer').equals(condition.deployer);
    }

    // 领取人
    if (condition.accepter) {
        query.where('accepter').equals(condition.accepter);
    }

    // 任务状态
    if (condition.status) {
        var statusArray = condition.status.split(",");
        var qr = new RegExp(statusArray.join("|"));
        query.where('status').equals(qr);
    }

    if ( !condition.isAll ) {
        query.limit(50);
    }
    // 按创建时间排序
    query.sort('-createDate');
    query.exec(function(err, result) {
        if (err) {
            deferred.reject(err);
        } else {
            var resObjs = dict.transCollection(result, 'status', 'taskStatus');
            deferred.resolve(resObjs);
        }
    });
    return deferred.promise; // the promise is returned
}

// 获取我的任务(本人待发布、待领取和已领取)
function fetchMyTask(data) {
    var deferred = Q.defer();

    var cond_dep = {
        deployer: data.userInfo.acctno,
        status: "1"
    }

    var cond_acp = {
        accepter: data.userInfo.acctno,
        status: "2,3"
    }

    Q.all([queryTaskRecord(cond_dep), queryTaskRecord(cond_acp)]).then(function(collections){
        var result = [];
        if ( collections[0] && collections[0].length > 0 ) {
            result = result.concat(collections[0]);
        }
        if ( collections[1] && collections[1].length > 0 ) {
            result = result.concat(collections[1]);
        }
        deferred.resolve(result);
    });

    return deferred.promise; // the promise is returned
}

// 创建任务
function createTask(data) {
    data.deployer = data.userInfo.acctno;
    return insertTaskRecord(data);
}

// 发布任务
function publishTask(data) {
    data.publishDate = Date.now();
    data.status = "2"; // 待领取
    return updateTaskRecord(data);
}

// 领取任务
function acceptTask(data) {
    data.accepter = data.userInfo.acctno;
    data.acceptDate = Date.now();
    data.status = "3"; // 已领取
    return updateTaskRecord(data);
}

// 完成任务
function completeTask(data) {
    data.completeDate = Date.now();
    data.status = "4"; // 已完成
    return updateTaskRecord(data);
}

exports.func = function(req, res, next) {

    var action = req.body.action;
    var msg = req.body.msg?req.body.msg:{};
    msg.userInfo = req.session.userInfo;

    if (action && msg) {

        // 检查action是否合法


        var promise = eval('(' + action + '(msg))');
        promise.then(function(result) {
            res.json({
                isSuccess: true,
                msg: result
            });
        }).
        catch (function(err) {
            res.json({
                isSuccess: false,
                msg: err
            });
        })

    } else {
        res.json({
            isSuccess: false,
            msg: "Error Input"
        });
    }

};
