
var express = require('express'),
    GithubApi = require('./githubapi'),
    app = express.createServer(),
    port = process.env.PORT || 1337;

app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: "d507cf3cef62295ab983310fabb8736b27e7046d" }));
    app.use(app.router);
    app.use(express.static(__dirname + '/files'));

    app.engine('jade', require('jade').__express);
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/pages');
});

// run with NODE_ENV=dev for debug config
app.configure('dev', function () {
    console.log('Using dev configuration');

    process.host = 'localhost';
    process.client_id = '78e3e8c40b1ca4c64828';
    process.client_secret = 'd507cf3cef62295ab983310fabb8736b27e7046d';

    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.get('*', function logging (req, res, next) {
        console.log(req.method, req.path);
        next();
    });
});


app.configure('sta', function () {
    console.log('Using sta configuration');
    
    process.host = "scrhub.herokuapp.com";
    process.client_id = 'f48190b0a23185d38240';
    process.client_secret = '1fb743a81c15bd41836f02686bd529674d90de9c';
});

var main_url = process.host=="localhost"?"http://localhost:"+port:"http://"+process.host;
app.locals.url = main_url;


app.get('*', function getToken (req, res, next) {
    if (!req.session.state) {
        req.session.state = {};
    }

    if (req.param('code')) {
        req.session.state.code = req.param('code');
    }

    if (req.session.state.code && !req.session.state.token) {
        console.log('-get token from github');
        new GithubApi(req.session.state).getToken(function (data) {
            if (data.access_token) {
                req.session.state.token = data.access_token;
            } else {
                console.log("-unexpected github response", data);
                req.session.state = {};
            }
            next();
        }).on("error", function () {
            console.log("error while getting new token...");
            req.session.state = {};
            next();
        });
    } else {
        next();
    }
});
app.get('*', function loadUser (req, res, next) {
    if (req.param("connect")) {
        private(req, res, next);
    }
    if (req.param("disconnect")) {
        req.session.state = {};
    }
    res.locals.path = req.path;
    res.locals.connected = Boolean(req.session.state.token);
    res.locals.user = req.session.state.user || {};
    if (req.session.state.token && !req.session.state.user) {
        new GithubApi(req.session.state).getUser(function (user) {
            res.locals.user = req.session.state.user = user;
            next();
        }).on("error", function () {
            console.log("error while getting new token...");
            req.session.state = {};
            next();
        });
    } else {
        next();
    }
});

function private (req, res, next) {
    console.log("-private request");
    if(!req.session.state.token && !req.param('error')) {
        var redirect_uri = main_url + req.path;
        var url = "https://github.com/login/oauth/authorize?client_id=" + process.client_id + "&redirect_uri=" + redirect_uri + "&scope=repo";
        console.log("-redirect to github auth", url);
        res.redirect(url);
    } else {
        next();
    }
}

function requestApi (req, res) {
    return new GithubApi(req.session.state).on("error", function (code, message) {
        res.json(code, message);
    });
}

app.get('/', function home (req, res) {
    res.render('home', {
        client_id: process.client_id
    });
});

app.get('/projects/', private, function projects (req, res) {
    requestApi(req, res).listProjects(function(projects) {
        res.render('project', { projects: projects });
    });
});
app.get('/projects/:name/', function orgProjects (req, res) {
    requestApi(req, res).listOrgProjects(req.params.name, function(projects) {
        res.render('project', { projects: projects });
    });
});

app.get('/:user/:name/dashboard/', function dashboard (req, res) {
    var project = req.params.user + '/' + req.params.name;
    requestApi(req, res).getProject(project, function(project) {
        res.render('dashboard', { 
            project: project
        });
    });
});

app.get('/:user/:name/backlog/', function backlog (req, res) {
    var project = req.params.user + '/' + req.params.name;
    requestApi(req, res).getProject(project, function(project) {
        res.render('backlog', { 
            project: project
        });
    });
});

app.get('/api/:user/:name/sprints/', function sprints (req, res) {
    var project = req.params.user + '/' + req.params.name;

    requestApi(req, res).listSpints(project, function (data) {
        var sprint = GithubApi.findCurrentSprint(data);
        sprint.current = true;
        res.json(data);
    });
});

app.get('/api/:user/:name/sprint/:sprint/stories/', function sprintStories (req, res) {
    var project = req.params.user + '/' + req.params.name;
    
    function loadStories (sprint) {
        requestApi(req, res).dashboardStories(project, sprint, function (data) {
            res.json(data);
        });
    }
    
    if (req.params.sprint == "current") {
        requestApi(req, res).listSpints(project, function (data) {
            loadStories(GithubApi.findCurrentSprint(data).number);
        });
    } else {
        loadStories(req.params.sprint);
    }

});

app.get('/api/:user/:name/stories/', function allStories (req, res) {
    var project = req.params.user + '/' + req.params.name;
    requestApi(req, res).allStories(project, function (data) {
        res.json(data);
    });
});

app.put('/api/:user/:name/story/:story', function updateStory (req, res) {
    var project = req.params.user + '/' + req.params.name;
    requestApi(req, res).updateStory(project, req.params.story, req.body, function (data) {
        res.json(data);
    });
});

app.post('/api/:user/:name/story/new', function createStory (req, res) {
    var project = req.params.user + '/' + req.params.name;
    requestApi(req, res).createStory(project, req.body, function (data) {
        res.json(data);
    });
});

app.get('/api/:user/:name/labels/', function allLabels (req, res) {
    var project = req.params.user + '/' + req.params.name;
    requestApi(req, res).allLabels(project, function (data) {
        res.json(data);
    });
});

app.listen(port);
console.log("Server running at " + main_url);

