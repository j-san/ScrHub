
require('dotenv').load();

var mongoose = require('mongoose'),
    logger = require('./src/utils/logging').logger;

var port = process.env.PORT || 1337,
    mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost/scrhub';


mongoose.connect(mongoUrl, function () {
    var app = require('./src/app')(mongoose.connection.db);

    if (app.env === 'production' || app.env === 'staging') {
        require('newrelic');
    }

    app.listen(port);
    logger.info("Server running on port " + port);
});

mongoose.connection.on('error', function () {
    logger.error('mongodb connection error', arguments);
});
