
var GithubApi = require('../models/GithubApi'),
    Story = require('../models/Story'),
    _ = require('underscore'),
    requestApi = GithubApi.requestApi;


function route (app) {
    'use strict';
    app.get('/api/:user/:name/sprints/', function sprints (req, res, next) {
        var project = req.params.user + '/' + req.params.name;

        requestApi(req, res, next).listSpints(project, function (data) {
            var sprint = GithubApi.findCurrentSprint(data);
            if (sprint) {
                sprint.current = true;
            }
            res.set('Content-Type', 'application/json');
            res.json(data);
        });
    });

    app.get('/api/:user/:name/sprint/:sprint/stories/', function sprintStories (req, res, next) {
        var project = req.params.user + '/' + req.params.name;

        function loadStories (sprint) {
            requestApi(req, res, next).dashboardStories(project, sprint, function (data) {
                Story.loadStories(data, function (stories) {
                    res.set('Content-Type', 'application/json');
                    res.json(stories);
                });
            });
        }

        if (req.params.sprint == 'current') {
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
            Story.loadStories(data).then(function (stories) {
                res.set('Content-Type', 'application/json');
                res.json(stories);
            });
        });
    });

    app.put('/api/:user/:name/story/:story', function updateStory (req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        var obj = req.body;
        requestApi(req, res, next).updateStory(project, req.params.story, obj, function (data) {
            obj.project = project;
            _.extend(obj, data);

            Story.findById(obj.id).then(function (story) {
                return _.extend(story.toObject(), obj);
            }, function() {
                // use new obj if id does not exist yet
                return obj;
            }).then(function (story) {
                story = new Story(story);
                return story.save();
            }).then(function (story) {
                res.set('Content-Type', 'application/json');
                res.json(_.extend(obj, story.toObject()));
            }, function (err) {
                next(err);
            });
        });
    });

    app.post('/api/:user/:name/story/new', function createStory (req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        requestApi(req, res, next).createStory(project, req.body, function (data) {
            res.set('Content-Type', 'application/json');
            res.json(data);
        });
    });

    app.get('/api/:user/:name/labels/', function allLabels (req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        requestApi(req, res, next).allLabels(project, function (data) {
            res.set('Content-Type', 'application/json');
            res.json(data);
        });
    });
}

/* binding */
exports.route = route;