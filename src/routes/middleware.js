
var express = require('express'),
    logging = require('../utils/logging'),
    MongoStore = require('connect-mongo')(express);

module.exports = function configureMiddleware(app, env) {

    app.engine('jade', require('jade').__express);
    app.set('view engine', 'jade');
    app.configure('sta', 'prd', function () {
        app.use(express.logger());
    });
    app.configure('dev', function () {
        app.use(express.logger('dev'));
    });

    app.use(express.compress());
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: "d507cf3cef62295ab983310fabb8736b27e7046d",
        store: new MongoStore({
            url: app.get('mongo-url'),
            db: 'scrhub'
        })
    }));

    app.use(app.router);
    app.use(express.static(__dirname + '/../../public'));
    app.use(logging.logErrors);

    app.configure('sta', 'prd', function () {
        logging.usePrdLogger();

        process.host = "www.scrhub.com";
        process.client_id = 'f48190b0a23185d38240';
        process.client_secret = process.env.GITHUB_SECRET;

        app.use(logging.errorHandler);
    });

    app.configure('dev', function () {
        process.host = 'localhost:'+ app.get('port');
        process.client_id = '78e3e8c40b1ca4c64828'; // for localhost:1337
        process.client_secret = 'd507cf3cef62295ab983310fabb8736b27e7046d';

        app.set('view options', { pretty: true });

        app.use(logging.debugErrorHandler);
    });

    app.configure('test', function () {
        process.host = 'localhost';
        process.client_id = '78e3e8c40b1ca4c64828';
        process.client_secret = 'd507cf3cef62295ab983310fabb8736b27e7046d';

        logging.useSilenteLogger();
    });
};
