require('co-mocha');

var nock = require('nock');


describe("views", function() {

    require('TestSetup').database();
    require('TestSetup').client();
    require('TestSetup').nock();

    describe("Home page", function() {
        it("should welcome in html", function* () {
            yield this.client.get('/')
                .expect('Content-Type', /html/)
                .expect(200)
                .expect(/Welcome to Scrum Hub/)
                .end();
        });
    });

    describe("Projects page", function() {
        it("should redirect to github auth page", function* () {
            yield this.client.get('/projects/')
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

            yield this.client.get('/projects/?code=xxx')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(/hello world/)
                .end();

            scope1.done();
            scope2.done();
        });
    });
});