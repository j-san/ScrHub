
var http = require("https"),
    querystring = require("querystring"),
    q = require("q"),
    request = require('request'),
    logger = require('../utils/logging').logger;


var GithubApi = function (state) {
    this.state = state;
};

GithubApi.findCurrentSprint = function (sprints) {
    var nearest = null;
    sprints.forEach(function (sprint) {
        if(!nearest || new Date(sprint.due_on) < new Date(nearest.due_on)) {
            nearest = sprint;
        }
    });
    return nearest;
};

GithubApi.prototype.getUser = function () {
    return this.load("/user");
};

GithubApi.prototype.listProjects = function () {
    return this.load("/user/repos");
};
GithubApi.prototype.listOrgProjects = function (name) {
    return this.load("/orgs/" + name + "/repos");
};
GithubApi.prototype.getProject = function (name) {
    return this.load("/repos/" + name);
};

GithubApi.prototype.allStories = function (project) {
    return this.load("/repos/" + project + "/issues");
};

GithubApi.prototype.allLabels = function (project) {
    return this.load("/repos/" + project + "/labels");
};

GithubApi.prototype.listSprints = function (project) {
    return this.load("/repos/" + project + "/milestones?state=open");
};

GithubApi.prototype.dashboardStories = function (project, sprint) {
    return this.load("/repos/" + project + "/issues" + (sprint?"?milestone="+sprint:""));
};

GithubApi.prototype.updateStory = function (project, story, data) {
    return this.update("/repos/" + project + "/issues/" + story, data);
};

GithubApi.prototype.createStory = function (project, data) {
    return this.create("/repos/" + project + "/issues", data);
};

GithubApi.prototype.load = function (path) {
    return this.request("GET", path);
};

GithubApi.prototype.update = function (path, data) {
    return this.request("PATCH", path, JSON.stringify(data));
};

GithubApi.prototype.create = function (path, data) {
    return this.request("POST", path, JSON.stringify(data));
};

GithubApi.prototype.getToken = function () {
    if(!this.state.code) {
        throw new Error('Not connected');
    }

    return this.request("POST", "/login/oauth/access_token", querystring.stringify({
            code: this.state.code,
            client_id: process.client_id,
            client_secret: process.client_secret
        }), {
            hostname: "https://github.com"
        });
};


GithubApi.prototype.request = function (method, uri, body, options, headers) {
    var self = this, deferred = q.defer();

    logger.debug('-', method, uri);

    options = options || {};
    options.headers = headers || {};
    var host = options.hostname || "https://api.github.com";
    delete options.hostname;
    options.uri = host + uri;
    options.method = method;
    options.body = body;
    options.headers['user-agent'] = 'SrcHub application';
    options.json = true;
    options.headers.Accept = "application/json";

    if (this.state && this.state.token) {
        options.headers.Authorization = "token " + this.state.token;
    }

    request(options, function (err, response, body) {
        if([200, 201].indexOf(response.statusCode) >= 0) {
            logger.info("+", method, uri);
            deferred.resolve(body);
        } else {
            deferred.reject(new Error(body.message + ' (' + uri + ' - ' + response.statusCode + ')'));
        }
    });

    return deferred.promise;
};

/* binding */
module.exports = GithubApi;
