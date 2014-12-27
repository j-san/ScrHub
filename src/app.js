
var koa = require('koa'),
    mongoose = require('mongoose'),
    session = require('koa-mongodb-session'),
    logger = require('koa-logger'),
    jade = require('koa-jade'),
    serve = require('koa-static');


module.exports = function(db) {
    var app = koa();

    app.use(logger());


    app.use(jade.middleware({
      viewPath: __dirname + '/../views',
      debug: false,
      pretty: false,
      compileDebug: false,
      locals: {}
    }));

    app.use(serve('static_modules'));
    app.use(serve('public'));

    app.keys = [process.env.SESSION_KEY || 'dev'];

    app.use(session({
        key: 'sid',
        collection: db.collection('session')
    }));

    require('./routes/main').route(app);
    require('./routes/api').route(app);

    return app;
};
