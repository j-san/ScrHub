
var GithubApi = require('../models/GithubApi'),
    Story = require('../models/Story'),
    merge = require('../utils/merge').merge,
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
                Story.loadStories(data, function (stories) {
                    res.json(stories);
                });
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
            Story.loadStories(data, function (stories) {
                res.json(stories);
            });
        });
    });

    app.put('/api/:user/:name/story/:story', function updateStory (req, res) {
        var project = req.params.user + '/' + req.params.name;
        var obj = req.body;
        requestApi(req, res).updateStory(project, req.params.story, obj, function (data) {
            obj.project = project;
            merge(data, obj);
            Story.sync(data, function (err, story) {
                res.json(story);
            });
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
