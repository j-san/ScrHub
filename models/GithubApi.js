
var http = require("https"),
    querystring = require("querystring"),
    EventEmitter = require('events').EventEmitter;

var GithubApi = function (state) {
    EventEmitter.call(this);
    this.state = state;
};

GithubApi.prototype = Object.create(EventEmitter.prototype);

GithubApi.findCurrentSprint = function (sprints) {
    var nearest = null;
    sprints.forEach(function (sprint) {
        if(!nearest || new Date(sprint.due_on) < new Date(nearest.due_on)) {
            nearest = sprint;
        }
    });
    return nearest;
};

GithubApi.prototype.getUser = function (cb) {
    return this.load("/user", cb);
};

GithubApi.prototype.listProjects = function (cb) {
    return this.load("/user/repos", cb);
};
GithubApi.prototype.listOrgProjects = function (name, cb) {
    return this.load("/orgs/" + name + "/repos", cb);
};
GithubApi.prototype.getProject = function (name, cb) {
    return this.load("/repos/" + name, cb);
};

GithubApi.prototype.allStories = function (project, cb) {
    return this.load("/repos/" + project + "/issues", cb);
};

GithubApi.prototype.allLabels = function (project, cb) {
    return this.load("/repos/" + project + "/labels", cb);
};

GithubApi.prototype.listSpints = function (project, cb) {
    return this.load("/repos/" + project + "/milestones?state=open", cb);
};

GithubApi.prototype.dashboardStories = function (project, sprint, cb) {
    return this.load("/repos/" + project + "/issues" + (sprint?"?milestone="+sprint:""), cb);
};

GithubApi.prototype.updateStory = function (project, story, data, cb) {
    return this.update("/repos/" + project + "/issues/" + story, data, cb);
};

GithubApi.prototype.createStory = function (project, data, cb) {
    return this.create("/repos/" + project + "/issues", data, cb);
};

GithubApi.prototype.load = function (path, cb) {
    return this.request("GET", path).on("success", cb);
};

GithubApi.prototype.update = function (path, data, cb) {
    return this.request("PATCH", path, JSON.stringify(data)).on("success", cb);
};

GithubApi.prototype.create = function (path, data, cb) {
    return this.request("POST", path, JSON.stringify(data)).on("success", cb);
};

GithubApi.prototype.getToken = function (cb) {
    if(!this.state.code) {
        throw new Error('Not connected');
    }

    return this.request("POST", "/login/oauth/access_token", querystring.stringify({
            code: this.state.code,
            client_id: process.client_id,
            client_secret: process.client_secret
        }), {
            hostname: "github.com"
        }).on("success", cb);
};


GithubApi.prototype.request = function (method, uri, data, options, headers, cb) {
    var request, self = this;

    console.log('-call', method, uri);

    options = options || {};
    options.headers = headers || {};
    options.path = uri;
    options.method = method;

    if (!options.hostname) {
        options.hostname = "api.github.com";
    }
    if (!options.headers.Accept) {
        options.headers.Accept = "application/json";
    }
    if (data) {
        options.headers["Content-Length"] = data.length;
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
                self.emit("success", JSON.parse(data));
            } else {
                console.log("error from github", res.statusCode, JSON.parse(data));
                self.emit("error", res.statusCode, JSON.parse(data));
            }
        });

    }).on('error', function(e) {
        self.emit("error", e);
    });
    if (data) {
        request.write(data);
    }
    request.end();
    return this;
};


function requestApi (req, res) {
    return new GithubApi(req.session.state).on("error", function (code, message) {
        res.json(code, message);
    });
}

/* binding */
GithubApi.requestApi = requestApi;
module.exports = GithubApi;
