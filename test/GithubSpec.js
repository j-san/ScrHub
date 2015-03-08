require('co-mocha');
require('should');

var nock = require('nock'),
    GithubApi = require('../src/models/GithubApi');

describe("Github Api", function() {
    require('./TestSetup').nock();

    it("should request github", function* () {

        var scope = nock("https://api.github.com")
            .get("/user")
            .reply(200, {})
            .get("/user/repos")
            .reply(200, {})
            .get("/orgs/hello/repos")
            .reply(200, {})
            .get("/repos/hello/world/issues")
            .reply(200, {})
            .get("/repos/hello/world/labels")
            .reply(200, {})
            .get("/repos/hello/world/issues?milestone=x")
            .reply(200, {});

        var api = new GithubApi({});

        yield [
            api.getUser(),
            api.listProjects(),
            api.listOrgProjects('hello'),
            api.allStories('hello/world'),
            api.allLabels('hello/world'),
            api.dashboardStories('hello/world', 'x')
        ];

        scope.done(); // validate all requests are performed
    });

    it("should fetch data to github", function* () {
        var scope = nock("https://api.github.com")
            .get("/repos/hello/world/milestones?state=open")
            .reply(200, [
                {number: 1, title: "V0.1"},
                {number: 2, title: "V0.2"},
                {number: 3, title: "V0.3"}
            ]);

        var sprints = yield new GithubApi({}).listSprints('hello/world');
        sprints.length.should.equal(3);

        scope.done();
    });

    it("should fetch a new github token", function* () {
        var scope = nock("https://github.com")
            .post("/login/oauth/access_token")
            .reply(200, {
                access_token: 'xxxx'
            });

        var auth = yield new GithubApi().getToken({code: 'fake code'});
        auth.should.have.property('access_token');

        scope.done();
    });
});