require('../src/utils/logging').useSilenteLogger();

var express = require('express'),
    sholud = require('should'),
    nock = require('nock'),
    client = require('supertest'),
    routeMain = require('../src/routes/main'),
    app;


nock.disableNetConnect();
nock.enableNetConnect(/(127.0.0.1.*|localhost.*)/);

describe("views", function() {
    before(function () {
        app = express();
        app.use(express.compress());
        app.use(express.urlencoded());
        app.use(express.json());
        app.use(express.cookieParser());
        app.use(express.session({
            secret: "d507cf3cef62295ab983310fabb8736b27e7046d"
        }));

        app.use(app.router);
        app.use(express.static(__dirname + '/../public'));

        app.engine('jade', require('jade').__express);
        app.set('view engine', 'jade');

        routeMain.route(app);
    });

    describe("Home page", function() {
        it("should display home page", function(done) {
            client(app).get('/')
                .expect('Content-Type', /html/)
                .expect(200)
                .expect(/Welcome to Scrum Hub/)
                .end(done);
        });
    });

    describe("Projects page", function(done) {
        it("should redirect to github auth page", function(done) {
            client(app).get('/projects/')
                .expect(302)
                .expect('location', /https:\/\/github.com\/login\/oauth\/authorize?.*/)
                .end(done);
        });

        it("should generate a token and dispaly list", function() {
        });
    });
});