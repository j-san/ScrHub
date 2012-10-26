
var express = require('express'),
    mongoose = require("mongoose"),
    nodemailer = require("nodemailer"),
    GithubApi = require('./githubapi'),
    //SessionStore = require('./models/Session'),
    MongoStore = require('connect-mongo')(express),
    routeMain = require('./routes/main'),
    routeApi = require('./routes/api'),
    port = process.env.PORT || 1337,
    app = express(),
    mongoURL = process.env.MONGO_URL,
    db = mongoose.createConnection(mongoURL);

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

    app.engine('jade', require('jade').__express);
    app.set('view engine', 'jade');
    // app.set('views', __dirname + '/views');
});

// run with NODE_ENV=dev for debug config
app.configure('dev', function () {
    console.log('Using dev configuration http://localhost:' + port);

    process.host = 'localhost:'+ port;
    process.client_id = '78e3e8c40b1ca4c64828';
    process.client_secret = 'd507cf3cef62295ab983310fabb8736b27e7046d';

    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.get('*', function logging (req, res, next) {
        console.log(req.method, req.path);
        next();
    });
});

app.configure('sta', function () {
    console.log('Using sta configuration');

    process.host = "www.scrhub.com";
    process.client_id = 'f48190b0a23185d38240';
    process.client_secret = process.env.GITHUB_SECRET;
    
    app.use(express.errorHandler({ dumpExceptions: false, showStack: false }));
});

routeMain.route(app);
routeApi.route(app);

db.once('open', function () {
  app.listen(port);
});

console.log("Server running");
