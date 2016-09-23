// var _ = require('lodash');
// var crypto = require('crypto');
var UserAccount = require('../models/user_account.js');

function authentication(req, res) {
    if (!req.session.userInfo) {
        res.redirect('/login');
    }
}

exports.login = function(req, res){
    res.render('login', {layout:'main'});
};
exports.logout = function(req, res){
    req.session.userInfo = null;
    res.redirect('/');
};
exports.checkUser = function(req, res) {

    var acctno = req.body.acctno;
    if ( !acctno ) {
        res.redirect('/login');
        //return;
    }

    var query = UserAccount.find();
    query.where('acctno').equals(acctno);
    query.exec(function(err, result){
        if ( result && result[0] && req.body.password === result[0].password ) {
            req.session.userInfo = {
                acctno: result[0].acctno,
                name: result[0].name,
                type: result[0].type,
                isAdmin: result[0].type==="0",
                department: result[0].department
            };
            res.redirect('/');
        } else {
            req.session.errMsg='用户名或密码不正确';
            res.redirect('/login');
        }
    });

};

exports.home = function(req, res){
    //authentication(req, res);
    res.render('home', {layout:'main'});
};
