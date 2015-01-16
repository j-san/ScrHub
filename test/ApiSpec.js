require('co-mocha');

var nock = require('nock'),
    client = require('co-supertest'),
    mongoose = require('mongoose'),
    initApp = require('../src/app');


// nock.enableNetConnect(/(127.0.0.1.*|localhost.*)/);

describe("api", function() {
    var app;

    before(function (done) {
        nock.disableNetConnect();
        nock.enableNetConnect(/(127.0.0.1.*|localhost.*)/);
        mongoose.connect('mongodb://localhost/scrhub-test', function() {
            app = initApp(mongoose.connection.db);
            done();
        });
    });

    it("should get stories", function* () {
        nock("https://api.github.com")
            .get("/repos/hello/world/issues")
            .reply(200, []);

        yield client(app.listen()).get('/api/hello/world/stories/')
            .expect(200)
            .expect('Content-Type', /json/)
            .end();
    });

    it("should create story", function* () {
        var scope = nock("https://api.github.com")
            .post("/repos/hello/world/issues")
            .reply(200, {
                id: "123",
                title: "hello",
                body: "world"
            });

        yield client(app.listen()).post('/api/hello/world/story/new', {
                id: "",
                title: "hello",
                body: "world",
                bunsinessValue: 10
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .end();

        scope.done();
    });

     after(function (done) {
        mongoose.connection.db.dropDatabase(function() {
            mongoose.disconnect(done);
        });
    });
});