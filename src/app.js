
var koa = require('koa'),
    mongoose = require("mongoose"),
    session = require('koa-mongodb-session'),
    router = require('koa-trie-router'),
    routeMain = require('./routes/main'),
    routeApi = require('./routes/api'),
    configure = require('./routes/middleware');


var app = koa(),
    port = process.env.PORT || 1337,
    mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost/scrhub';

if (app.env === 'production' || app.env === 'staging') {
    require('newrelic');
}
require('dotenv').load();

configure(app);

var logger = require('./utils/logging').logger;

mongoose.connect(mongoUrl, function () {
    app.use(session({
        key: process.env.SESSION_KEY || 'sid',
        collection: mongoose.connection.db.collection('session')
    }));
    app.keys = [process.env.SESSION_KEY || 'sid'];

    app.use(router(app));
    routeMain.route(app);
    routeApi.route(app);

    app.listen(port);
    logger.info("Server running on port " + port);
});

mongoose.connection.on('error', function () {
    logger.error('mongodb connection error', arguments);
});

