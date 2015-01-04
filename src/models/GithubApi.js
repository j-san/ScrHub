
var http = require("https"),
    querystring = require("querystring"),
    request = require('request'),
    logger = require('../utils/logging').logger;

function AuthenticationRequiredError() {
  Error.apply(this, arguments);
  this.name = 'AuthenticationRequired';
  this.status = 401;
}
AuthenticationRequiredError.prototype = Error.prototype;


var GithubApi = function (token) {
    this.token = token;
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
GithubApi.prototype.getToken = function (options) {
    if(!options.code) {
        throw new Error('Not connected');
    } else {
        return this.request(
            "POST",
            "/login/oauth/access_token",
            querystring.stringify({
                code: options.code,
                client_id: options.client_id,
                client_secret: options.client_secret,
                scope: options.scope
            }), {
                hostname: "https://github.com"
            });
    }
};

GithubApi.prototype.loginUrl = function (options) {
    var url = 'https://github.com/login/oauth/authorize';

    url += '?' + querystring.stringify({
        client_id: options.client_id,
        redirect_uri: options.redirect_uri,
        scope: options.scope.join(',')
    });

    return url;
};

GithubApi.prototype.authenticationRequired = function () {
    if(!this.token) {
        throw new AuthenticationRequiredError();
    }
};

GithubApi.prototype.getUser = function () {
    this.authenticationRequired();
    return this.load("/user");
};

GithubApi.prototype.listProjects = function () {
    this.authenticationRequired();
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

GithubApi.prototype.request = function (method, uri, body, options, headers) {
    var self = this;

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

    if (this.token) {
        options.headers.Authorization = "token " + this.token;
    }
    return new Promise(function (resolve, reject) {

        request(options, function (err, response, body) {
            if([200, 201].indexOf(response.statusCode) >= 0) {
                logger.info("+", method, uri);
                resolve(body);
            } else {
                logger.error("+", response.statusCode, uri, body.message);
                var error = new Error(body.message);
                error.status = response.statusCode;
                reject(error);
            }
        });
    });
};

/* binding */
module.exports = GithubApi;
