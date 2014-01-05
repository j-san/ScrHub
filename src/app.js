
var express = require('express'),
    mongoose = require("mongoose"),

    //SessionStore = require('./models/Session'),
    MongoStore = require('connect-mongo')(express),
    routeMain = require('./routes/main'),
    routeApi = require('./routes/api'),
    logging = require('./utils/logging'),
    logger = logging.logger,
    port = process.env.PORT || 1337,
    app = express(),
    logger,
    mongoURL = process.env.MONGOLAB_URI || 'mongodb://localhost/scrhub';


app.set('env', process.env.NODE_ENV || 'dev');

app.configure(function () {
    app.use(express.logger());
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: "d507cf3cef62295ab983310fabb8736b27e7046d",
        store: new MongoStore({
            url: mongoURL,
            db: 'scrhub'
        })
    }));

    app.use(app.router);
    app.use(express.static(__dirname + '/../public'));

    app.use(logging.logErrors);

    app.engine('jade', require('jade').__express);
    app.set('view engine', 'jade');
    // app.set('views', __dirname + '/views');
});

app.configure('sta', 'prd', function () {
    require('newrelic');

    logging.usePrdLogger();

    logger.info('Using sta/prd configuration');

    process.host = "www.scrhub.com";
    process.client_id = 'f48190b0a23185d38240';
    process.client_secret = process.env.GITHUB_SECRET;

    app.use(logging.errorHandler);
});

// run with NODE_ENV=dev for debug config
app.configure('dev', function () {

    logger.info('Using dev configuration http://localhost:' + port);
    process.host = 'localhost:'+ port;
    process.client_id = '78e3e8c40b1ca4c64828'; // for localhost:1337
    process.client_secret = 'd507cf3cef62295ab983310fabb8736b27e7046d';

    app.set('view options', { pretty: true });

    app.use(logging.debugErrorHandler);
});

routeMain.route(app);
routeApi.route(app);

mongoose.connect(mongoURL, function () {
    app.listen(port);
    logger.info("Server running");
});

mongoose.connection.on('error', function () {
    logger.error('mongodb connection error', arguments);
});

