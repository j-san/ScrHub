
var express = require('express'),
    mongoose = require("mongoose"),

    routeMain = require('./routes/main'),
    routeApi = require('./routes/api'),
    app = express(),
    middleware = require('./routes/middleware');


app.set('env', process.env.NODE_ENV || 'dev');
app.set('port', process.env.PORT || 1337);
app.set('mongo-url', process.env.MONGOLAB_URI || 'mongodb://localhost/scrhub');

app.configure('sta', 'prd', function () {
    require('newrelic');
});

middleware(app, app.get('env'));

routeMain.route(app);
routeApi.route(app);

var logger = require('./utils/logging').logger;

mongoose.connect(app.get('mongo-url'), function () {
    app.listen(app.get('port'));
    logger.info("Server running");
});

mongoose.connection.on('error', function () {
    logger.error('mongodb connection error', arguments);
});

