
var http = require("https");
var querystring = require("querystring");

var GithubApi = function (state) {
    this.state = state;
};

GithubApi.prototype.listProjects = function (cb) {
    this.call("/user/repos", cb);
    return this;
};

GithubApi.prototype.allStories = function (project, cb) {
    this.call("/repos/" + project + "/issues", cb);
    return this;
};

GithubApi.prototype.listSpints = function (project, cb) {
    this.call("/repos/" + project + "/milestones?state=open", cb);
    return this;
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

GithubApi.prototype.dashboardStories = function (project, sprint, cb) {
    this.call("/repos/" + project + "/issues" + (sprint?"?milestone="+sprint:""), cb);
    return this;
};


GithubApi.prototype.getToken = function (cb) {
    if(!this.state.code) {
        throw new Error('Not connected');
    }
    
    var params = {
            code: this.state.code,
            client_id: process.client_id,
            client_secret: process.client_secret
        },
        headers = {
            Accept: "application/json"
        };

    http.get({
        hostname: "api.github.com",
        path: "/login/oauth/access_token?" + querystring.stringify(params),
        headers: headers
    }, function(res) {
        console.log("Got response: ", res.statusCode);

        res.on("data", function (data) {
            console.log("token data: " + data);
            cb(JSON.parse(data).access_token);
        });
    }).on('error', function(e) {
        console.log("Got error:", e.message);
    });
    return this;
};

GithubApi.prototype.call = function (path, cb) {
    var request, headers = {}, self = this;

    console.log('-call:', path);
    if (this.state && this.state.token) {
        console.log(this.state.token);
        headers.Authorization = "token " + this.state.token;
    }

    request = http.request({
        hostname: "api.github.com",
        path: path,
        headers: headers
    }, function(res) {
        console.log("Got response: ", res.statusCode);
        var data = "";
        res.on("data", function (buff) {
            data += buff;
        });
        res.on("end", function () {
            console.log("content: " + data);
            if(cb) {
                cb(JSON.parse(data));
            }
        });

    }).on('error', function(e) {
        console.log("Got error:", e.message);
    });
    request.end();
    return this;
};

module.exports = GithubApi;
