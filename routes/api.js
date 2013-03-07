
var GithubApi = require('../models/GithubApi'),
    Story = require('../models/Story'),
    merge = require('../utils/merge').merge,
    requestApi = GithubApi.requestApi;


function route (app) {
    app.get('/api/:user/:name/sprints/', function sprints (req, res, next) {
        var project = req.params.user + '/' + req.params.name;

        requestApi(req, res, next).listSpints(project, function (data) {
            var sprint = GithubApi.findCurrentSprint(data);
            if (sprint) {
                sprint.current = true;
            }
            res.json(data);
        });
    });

    app.get('/api/:user/:name/sprint/:sprint/stories/', function sprintStories (req, res, next) {
        var project = req.params.user + '/' + req.params.name;

        function loadStories (sprint) {
            requestApi(req, res, next).dashboardStories(project, sprint, function (data) {
                Story.loadStories(data, function (stories) {
                    res.json(stories);
                });
            });
        }

        if (req.params.sprint == "current") {
            requestApi(req, res, next).listSpints(project, function (data) {
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

    app.get('/api/:user/:name/stories/', function allStories (req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        requestApi(req, res, next).allStories(project, function (data) {
            Story.loadStories(data, function (stories) {
                res.json(stories);
            });
        });
    });

    app.put('/api/:user/:name/story/:story', function updateStory (req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        var obj = req.body;
        requestApi(req, res, next).updateStory(project, req.params.story, obj, function (data) {
            obj.project = project;
            merge(obj, data);

            Story.sync(obj, function (err, story) {
                if (err) {
                    next(err);
                }
                res.json(story);
            });
        });
    });

    app.post('/api/:user/:name/story/new', function createStory (req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        requestApi(req, res, next).createStory(project, req.body, function (data) {
            res.json(data);
        });
    });

    app.get('/api/:user/:name/labels/', function allLabels (req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        requestApi(req, res, next).allLabels(project, function (data) {
            res.json(data);
        });
    });
}

/* binding */
exports.route = route;
