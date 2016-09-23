var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var autoIncrement = require('mongoose-auto-increment');
//autoIncrement.initialize(mongoose);

var userAccountSchema = new Schema({
    // 账号
    acctno: { type: String, index: true, unique: true, required: true },
    // 姓名
    name: { type: String, index: true, required: true },
    // 密码
    password: { type: String, required: true },
    // 用户类型
    type: String,
    // 所属部门 
    department: String,
    // 用户状态
    status: String
});

var UserAccount = mongoose.model('UserAccount', userAccountSchema);
module.exports = UserAccount;
