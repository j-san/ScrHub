require('../src/utils/logging').useSilenteLogger();

var express = require('express'),
    sholud = require('should'),
    nock = require('nock'),
    client = require('supertest'),
    mongoose = require('mongoose'),
    routeApi = require('../src/routes/api'),
    app;


nock.disableNetConnect();
nock.enableNetConnect(/(127.0.0.1.*|localhost.*)/);

describe("api", function() {

    before(function (done) {
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

        routeApi.route(app);

        mongoose.connect('mongodb://localhost/scrhub-test', function () {
            done();
        });
    });

     after(function(done) {
        mongoose.connection.db.dropDatabase(function(){
            mongoose.disconnect(function(){
                done();
            });
        });
    });

    it("should get stories", function(done) {
        nock("https://api.github.com")
            .get("/repos/hello/world/issues")
            .reply(200, []);

        client(app).get('/api/hello/world/stories/')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(done);
    });

    it("should create story", function(done) {
        nock("https://api.github.com")
            .post("/repos/hello/world/issues")
            .reply(200, {
                id: "123",
                title: "hello",
                body: "world"
            });

        client(app).post('/api/hello/world/story/new', {
                id: "",
                title: "hello",
                body: "world",
                bunsinessValue: 10
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .end(done);
    });
});