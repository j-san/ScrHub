
var koa = require('koa'),
    session = require('koa-mongodb-session'),
    logger = require('koa-logger'),
    jade = require('koa-jade'),
    serve = require('koa-static');


module.exports = function(db) {
    var app = koa();

    if (app.env === 'development') {
        app.use(logger());
    }

    app.use(serve('static_modules'));
    app.use(serve('public'));

    app.use(jade.middleware({
        viewPath: __dirname + '/../views',
        debug: app.env === 'development',
        pretty: app.env === 'development',
        compileDebug: app.env === 'development',
        locals: {}
    }));

    app.keys = [process.env.SESSION_KEY || 'dev'];

    app.use(session({
        key: 'sid',
        collection: db.collection('session')
    }));

    require('./routes/main').route(app);
    require('./routes/api').route(app);

    return app;
};
