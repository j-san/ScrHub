
var http = require("https"),
    querystring = require("querystring"),
    q = require("q");


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
            hostname: "github.com"
        });
};


GithubApi.prototype.request = function (method, uri, body, options, headers) {
    var request, self = this, deferred = q.defer();

    console.log('-call', method, uri);

    options = options || {};
    options.headers = headers || {};
    options.path = uri;
    options.method = method;
    options.headers['user-agent'] = 'SrcHub apllication';

    if (!options.hostname) {
        options.hostname = "api.github.com";
    }
    if (!options.headers.Accept) {
        options.headers.Accept = "application/json";
    }
    if (body) {
        options.headers["Content-Length"] = body.length;
    }
    if (this.state && this.state.token) {
        options.headers.Authorization = "token " + this.state.token;
    }

    request = http.request(options, function(res) {
        var data = "";
        res.on("data", function (buff) {
            data += buff;
        });
        res.on("end", function () {
            if (res.statusCode == 200) {
                console.log("-response", method, uri);
                deferred.resolve(JSON.parse(data));
            } else {
                console.error('error', method, uri, res.statusCode, data);
                deferred.reject(new Error(JSON.parse(data).message));
            }
        });

    }).on('error', function(e) {
        console.error(method, uri);
        deferred.reject(e);
    });
    if (body) {
        request.write(body);
    }
    request.end();
    return deferred.promise;
};


GithubApi.requestApi = function (req) {
    return new GithubApi(req.session.state);
};

/* binding */
module.exports = GithubApi;
