var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose);

var articleSchema = new Schema({
    // 文章编号
    articleId: { type: String, index: true, unique: true, required: true },
    // 作者
    author: { type: String, default: "" },
    // 标签
    tags: { type: String, default: "" },
    // 内容格式
    contentFormat: { type: String, default: "md" },
    // 内容
    content: { type: String, required: true },
    // 创建日期
    createDate: { type: Date, default: Date.now },
    // 最后更新日期
    updateDate: { type: Date, default: Date.now }
});

articleSchema.plugin(autoIncrement.plugin, {
    model: 'Article',
    field: 'articleId',
    startAt: 10000,
    incrementBy: 1
});

articleSchema.set('toJSON', { virtuals: true });
articleSchema.set('toObject', { virtuals: true });

var Article = mongoose.model('Article', articleSchema);
module.exports = Article;
