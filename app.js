var http = require('http');
var express = require('express');

var app = express();

// set up handlebars view engine
var handlebars = require('express3-handlebars').create({
    defaultLayout:'main',
    helpers: {
        // section: function(name, options){
        //     if(!this._sections) this._sections = {};
        //     this._sections[name] = options.fn(this);
        //     return null;
        // },
        static: function(name) {
            return require('./lib/static.js').map(name);
        }
    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// set up css/js bundling
// var bundler = require('connect-bundle')(require('./config.js'));
// app.use(bundler);

// compact, colorful dev logging
// app.use(require('morgan')('dev'));

var credentials = require('./credentials.development.js');

app.set('port', process.env.PORT || credentials.appPort);

var MongoSessionStore = require('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({ url: credentials.mongo.connectionString });

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({ store: sessionStore }));
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')());

// database configuration
var mongoose = require('mongoose');
var options = {
    server: {
       socketOptions: { keepAlive: 1 }
    }
};
mongoose.connect(credentials.mongo.connectionString, options);

// 传递回话中的用户信息
app.use(function(req, res, next) {
    if (req.session.userInfo) res.locals.userInfo = req.session.userInfo;
    next();
});

// add www routes
require('./routes/routes.js')(app);

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
    res.status(404);
    res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

var server;

function startServer() {
    server = http.createServer(app).listen(app.get('port'), function(){
      console.log( 'Express started in ' + app.get('env') +
        ' mode on http://localhost:' + app.get('port') +
        '; press Ctrl-C to terminate.' );
    });
}

if(require.main === module){
    // application run directly; start app server
    startServer();
} else {
    // application imported as a module via "require": export function to create server
    module.exports = startServer;
}
