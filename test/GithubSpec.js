var sinon = require('sinon');
var sholud = require('should');
var nock = require('nock');
var q = require('q');
var GithubApi = require('../src/models/GithubApi');

nock.disableNetConnect();

describe("Github Api", function(done) {
    it("should request to Github", function() {
        nock("https://api.github.com")
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
        q.all([
            api.getUser(),
            api.listProjects(),
            api.listOrgProjects('hello'),
            api.allStories('hello/world'),
            api.allLabels('hello/world'),
            api.dashboardStories('hello/world', 'x')
        ]).then(function () {
            done();
        }).fail(function (err) {
            done(err);
        });
    });

    it("should return fetched data", function() {
        nock("https://api.github.com")
            .get("/repos/hello/world/milestones?state=open")
            .reply(200, [
                {number: 1, title: "V0.1"},
                {number: 2, title: "V0.2"},
                {number: 3, title: "V0.3"}
            ]);

        (new GithubApi({})).listSprints('hello/world').then(function (sprints) {
            sprints.length.should.be(3);
            done();
        }).fail(function (err) {
            done(err);
        });
    });

    it("should generate a new token", function() {
        nock("https://github.com")
            .post("/login/oauth/access_token")
            .reply(200, {
                access_token: 'xxxx'
            });

        (new GithubApi({code: "fake"})).getToken().then(function (data) {
            data.should.have.property('access_token');
            done();
        });
    });
});