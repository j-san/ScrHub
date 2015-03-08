
require('dotenv').load();

var logger = require('./src/utils/logging').logger,
    mongoose = require('mongoose');

var port = process.env.PORT || 1337,
    mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost/scrhub';


mongoose.connect(mongoUrl, function (err) {
    if (err) {
        console.error('mongodb connection error', err);
        process.exit(1);
    }
    var app = require('./src/app')(mongoose.connection.db);

    app.listen(port);
    logger.info("Server running on port " + port);
});

mongoose.connection.on('error', function () {
    logger.error('mongodb connection error', arguments);
});
