
var GithubApi = require('../models/GithubApi'),
    Story = require('../models/Story'),
    _ = require('underscore'),
    q = require('q'),
    requestApi = GithubApi.requestApi;


function route (app) {
    'use strict';

    function responseSuccess (res) {
        return function (data) {
            res.set('Content-Type', 'application/json');
            res.json(data);
        };
    }
    function responseError (next) {
        return function (error) {
            next(error);
            // res.statusCode = error.code || 500;
            // res.set('Content-Type', 'application/json');
            // res.json({ message: error.message, stack: error.stack });
        };
    }

    app.get('/api/:user/:name/sprints/', function sprints (req, res, next) {
        var project = req.params.user + '/' + req.params.name;

        requestApi(req, res, next).listSprints(project).then(function (data) {
            var sprint = GithubApi.findCurrentSprint(data);
            if (sprint) {
                sprint.current = true;
            }
            return sprint;
        }).then(responseSuccess(res), responseError(next));
    });

    app.get('/api/:user/:name/sprint/:sprint/stories/', function sprintStories (req, res, next) {
        var project = req.params.user + '/' + req.params.name, promise;

        if (req.params.sprint == 'current') {
            promise = requestApi(req, res, next).listSprints(project).then(function (data) {
                if (data.length) {
                    return GithubApi.findCurrentSprint(data).number;
                } else {
                    return null;
                }
            });
        } else {
            promise = q.fcall(function () {
                return req.params.sprint;
            });
        }
        promise.then(function (sprint) {
            return requestApi(req, res, next).dashboardStories(project, sprint);
        }).then(function (data) {
            return Story.loadStories(data);
        }).then(responseSuccess(res), responseError(next));

    });

    app.get('/api/:user/:name/stories/', function allStories (req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        requestApi(req, res, next).allStories(project).then(function (data) {
            return Story.loadStories(data);
        }).then(responseSuccess(res), responseError(next));
    });

    app.put('/api/:user/:name/story/:story', function updateStory (req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        var storySended = req.body;
        var githubStory;
        q.all([
            requestApi(req, res, next).updateStory(project, req.params.story, storySended),
            Story.findById(storySended.id).exec()
        ]).then(function (data, story) {
            storySended.project = project;
            githubStory = data;
            if (story) {
                return story.set(storySended).set(githubStory);
            } else {
                // use new obj if id does not exist yet
                return new Story(storySended).set(githubStory);
            }
        }).then(function (story) {
            return q.ninvoke(story, 'save');
        }).then(function (args) {
            return _.extend(args[0].toObject(), githubStory[0]);
        }).then(responseSuccess(res), responseError(next));
    });

    app.post('/api/:user/:name/story/new', function createStory (req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        requestApi(req, res, next).createStory(project, req.body).then(function (story) {
            return q.ninvoke(new Story(story), 'save');
        }).then(responseSuccess(res), responseError(next));

    });

    app.get('/api/:user/:name/labels/', function allLabels (req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        requestApi(req, res, next).allLabels(project)
                .then(responseSuccess(res), responseError(next));
    });
}

/* binding */
exports.route = route;
