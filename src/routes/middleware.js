
var serve = require('koa-static'),
    jade = require('koa-jade'),
    logger = require('koa-logger'),
    _ = require('koa-route'),
    logging = require('../utils/logging');

module.exports = function configure(app) {
    app.use(jade.middleware({
        viewPath: 'views',
        debug: (app.env === 'development'),
        noCache: (app.env === 'development')
    }));

    app.use(logger());

    // app.use(express.compress());
    // app.use(express.urlencoded());
    // app.use(express.json());
    // app.use(express.cookieParser());

    app.use(serve('public'));
};
