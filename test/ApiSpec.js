require('co-mocha');

var nock = require('nock');

describe("api", function() {

    require('TestSetup').database();
    require('TestSetup').client();
    require('TestSetup').nock();

    it("should get stories", function* () {
        nock("https://api.github.com")
            .get("/repos/hello/world/issues")
            .reply(200, []);

        yield this.client.get('/api/hello/world/stories/')
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

        yield this.client.post('/api/hello/world/story/new', {
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
});