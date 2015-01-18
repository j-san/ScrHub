
var koa = require('koa'),
    session = require('koa-mongodb-session'),
    jade = require('koa-jade'),
    serve = require('koa-static'),
    debug = require('koa-logger'),
    bodyParser = require('koa-bodyparser'),
    koaLogentries = require('./utils/koa-logentries'),
    pkg = require('../package'),
    logging = require('./utils/logging');


module.exports = function(db) {
    var app = koa();
    app.debug = app.env === 'development';
    app.version = pkg.version;

    if (app.debug) {
        app.use(debug());
        logging.useDebugLogger();
    } else if (app.env !== 'test') {
        logging.useLogentriesLogger({ token: process.env.LOGENTRIES_TOKEN });
        app.use(koaLogentries({ token: process.env.LOGENTRIES_TOKEN }));
    }


    app.use(serve('static_modules'));
    app.use(serve('public'));

    app.use(jade.middleware({
        viewPath: __dirname + '/../views',
        debug: app.debug,
        pretty: app.debug,
        compileDebug: app.debug,
        locals: {}
    }));

    app.keys = [process.env.SESSION_KEY || 'dev'];

    app.use(session({
        key: 'sid',
        collection: db.collection('session')
    }));

    app.use(bodyParser());
    require('./routes/main').route(app);
    require('./routes/api').route(app);

    return app;
};
