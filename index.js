
var express = require('express'),
    mongoose = require("mongoose"),
    nodemailer = require("nodemailer"),
    //SessionStore = require('./models/Session'),
    MongoStore = require('connect-mongo')(express),
    routeMain = require('./routes/main'),
    routeApi = require('./routes/api'),
    logging = require('./utils/logging'),
    port = process.env.PORT || 1337,
    app = express(),
    mongoURL = process.env.MONGO_URL || process.env.MONGOLAB_URI;


// run with NODE_ENV=dev for debug config
app.configure('dev', function () {
    console.log('Using dev configuration http://localhost:' + port);

    process.host = 'localhost:'+ port;
    process.client_id = '78e3e8c40b1ca4c64828';
    process.client_secret = 'd507cf3cef62295ab983310fabb8736b27e7046d';

    app.use(logging.logRequest);

    app.use(logging.clientErrorHandler);
});

app.configure('sta', function () {
    console.log('Using sta configuration');

    process.host = "www.scrhub.com";
    process.client_id = 'f48190b0a23185d38240';
    process.client_secret = process.env.GITHUB_SECRET;

    app.use(logging.errorHandler);
});

app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: "d507cf3cef62295ab983310fabb8736b27e7046d",
        store: new MongoStore({
            url: mongoURL
        })
    }));
    
    app.use(app.router);
    app.use(express.static(__dirname + '/files'));

    app.use(logging.logErrors);

    app.engine('jade', require('jade').__express);
    app.set('view engine', 'jade');
    // app.set('views', __dirname + '/views');
});

routeMain.route(app);
routeApi.route(app);

mongoose.connect(mongoURL, function () {
    app.listen(port);
    console.log("Server running");
});

mongoose.connection.on('error', function () {
  console.error('mongodb connection error', arguments);
});


