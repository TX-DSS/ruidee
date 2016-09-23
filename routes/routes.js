
var main = require('../handlers/main.js');
var cors = require('cors');

module.exports = function(app){

    // 请求主页面
    app.get('/', main.home);

    // 请求登录页面
    app.get('/login', main.login);
    // 校验登录用户
    app.post('/login', main.checkUser);
    // 登出操作
    app.get('/logout', main.logout);

};
