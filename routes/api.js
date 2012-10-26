
var GithubApi = require('../githubapi'),
    requestApi = GithubApi.requestApi;


function route (app) {
    app.get('/api/:user/:name/sprints/', function sprints (req, res) {
        var project = req.params.user + '/' + req.params.name;

        requestApi(req, res).listSpints(project, function (data) {
            var sprint = GithubApi.findCurrentSprint(data);
            if (sprint) {
                sprint.current = true;
            }
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
                if (data.length) {
                    loadStories(GithubApi.findCurrentSprint(data).number);
                } else {
                    loadStories();
                }
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
}

/* binding */
exports.route = route;
