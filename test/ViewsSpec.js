require('co-mocha');

var nock = require('nock'),
    client = require('co-supertest'),
    mongoose = require('mongoose'),
    initApp = require('../src/app');


describe("views", function() {
    var app;
    before(function (done) {
        nock.disableNetConnect();
        nock.enableNetConnect(/(127.0.0.1.*|localhost.*)/);
        mongoose.connect('mongodb://localhost/scrhub-test', function() {
            app = initApp(mongoose.connection.db);
            done();
        });
    });

    describe("Home page", function() {
        it("should welcome in html", function* () {
            yield client(app.listen()).get('/')
                .expect('Content-Type', /html/)
                .expect(200)
                .expect(/Welcome to Scrum Hub/)
                .end();
        });
    });

    describe("Projects page", function() {
        it("should redirect to github auth page", function* () {
            yield client(app.listen()).get('/projects/')
                .expect(302)
                .expect('location', /https:\/\/github.com\/login\/oauth\/authorize?.*/)
                .end();
        });

        it("should generate a token and dispaly projects list", function* () {
            var scope1 = nock("https://github.com")
                .post("/login/oauth/access_token")
                .reply(200, {
                    access_token: "zzz"
                });
            var scope2 = nock("https://api.github.com")
                .get("/user/repos")
                .reply(200, [
                    {full_name: 'hello world'}
                ]);

            yield client(app.listen()).get('/projects/?code=xxx')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(/hello world/)
                .end();

            scope1.done();
            scope2.done();
        });
    });

    after(function (done) {
        mongoose.connection.db.dropDatabase(function () {
            mongoose.disconnect(done);
        });
    });
});