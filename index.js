
var express = require('express'),
    GithubApi = require('./githubapi'),
    app = express.createServer(),
    host = 'localhost',
    port = process.env.PORT || 1337,
    main_url = host=="localhost"?"http://localhost:"+port:"http://"+host;

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

    process.client_id = '78e3e8c40b1ca4c64828';
    process.client_secret = 'd507cf3cef62295ab983310fabb8736b27e7046d';
    host = "http://scrhub.herokuapp.com/";

    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.get('*', function logging (req, res, next) {
        console.log(req.method, req.path);
        next();
    });
});

app.configure('sta', function () {
    console.log('Using sta configuration');
    
    process.client_id = 'f48190b0a23185d38240';
    process.client_secret = '1fb743a81c15bd41836f02686bd529674d90de9c';
});


function private (req, res, next) {
    console.log("-private request");
    if (!req.session.state) {
        req.session.state = {};
    }
    if (req.param('code')) {
        req.session.state.code = req.param('code');
    }

    if(!req.session.state.code) {
        var redirect_uri = main_url + req.path;
        var url = "https://github.com/login/oauth/authorize?client_id=" + process.client_id + "&redirect_uri=" + redirect_uri + "&scope=repo";
        console.log("-redirect to github auth", url);
        res.redirect(url);
        return;
    }
    if(!req.session.state.token) {
        console.log('-get token from github');
        new GithubApi(req.session.state).getToken(function (token) {
            req.session.state.token = token;
            next()
        });
    } else {
        next();
    }
}

app.get('/', function home (req, res) {
    res.render('home', {
        client_id: process.client_id
    });
});

app.get('/project/', private, function project (req, res) {
    new GithubApi(req.session.state).listProjects(function(projects) {
        res.render('project', { projects: projects });
    });
});

app.get('/:user/:name/dashboard/', function dashboard (req, res) {
    var project = req.params.user + '/' + req.params.name;
    res.render('dashboard', { 
        project: project
    });
});

app.get('/:user/:name/backlog/', function backlog (req, res) {
    var project = req.params.user + '/' + req.params.name;
    res.render('backlog', { 
        project: project
    });
});

app.get('/api/:user/:name/sprints/', function sprints (req, res) {
    var project = req.params.user + '/' + req.params.name,
        sprint = null;

    new GithubApi(req.session.state).listSpints(project, function(sprints) {
        var sprint = GithubApi.findCurrentSprint(sprints);
        sprint.current = true;
        res.json(sprints);
    });
});

app.get('/api/:user/:name/sprint/:sprint/stories/', function sprintStories (req, res) {
    var project = req.params.user + '/' + req.params.name;
    new GithubApi(req.session.state).dashboardStories(project, req.params.sprint, function(sprints) {
        res.json(sprints);
    });
});

app.get('/api/:user/:name/stories/', function allStories (req, res) {
    var project = req.params.user + '/' + req.params.name;
    new GithubApi(req.session.state).allStories(project, function(stories) {
        res.json(stories);
    });
});

app.listen(port);
console.log("Server running at " + main_url);

