
var GithubApi = require('../models/GithubApi'),
    Story = require('../models/Story'),
    _ = require('underscore'),
    q = require('q'),
    requestApi = GithubApi.requestApi;


function route (app) {
    'use strict';

    function apiHandler (callback) {
        return function (req, res, next) {
            callback(new GithubApi(req.session.state), req, res, next)
                .then(function (data) {
                    res.set('Content-Type', 'application/json');
                    res.json(data);
                }, function (error) {
                    next(error);
                });
        };
    }

    app.get('/api/:user/:name/sprints/', apiHandler(function sprints (api, req, res, next) {
        var project = req.params.user + '/' + req.params.name;

        return api.listSprints(project).then(function (data) {
            var sprint = GithubApi.findCurrentSprint(data);
            if (sprint) {
                sprint.current = true;
            }
            return sprint;
        });
    }));

    app.get('/api/:user/:name/sprint/:sprint/stories/', apiHandler(function sprintStories (api, req, res, next) {
        var project = req.params.user + '/' + req.params.name, promise;

        if (req.params.sprint === 'current') {
            promise = requestApi(req.session.state).listSprints(project).then(function (data) {
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
        return promise.then(function (sprint) {
            return requestApi(req.session.state).dashboardStories(project, sprint);
        }).then(function (data) {
            return Story.loadStories(data);
        });
    }));

    app.get('/api/:user/:name/stories/', apiHandler(function allStories (api, req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        return api.allStories(project).then(function (data) {
            return Story.loadStories(data);
        });
    }));

    app.put('/api/:user/:name/story/:story', apiHandler(function updateStory (api, req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        var storySended = req.body;
        var githubStory;
        return q.all([
            api.updateStory(project, req.params.story, storySended),
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
        });
    }));

    app.post('/api/:user/:name/story/new', function createStory (api, req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        return api.createStory(project, req.body).then(function (story) {
            return q.ninvoke(new Story(story), 'save');
        });

    });

    app.get('/api/:user/:name/labels/', function allLabels (api, req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        return api.allLabels(project);
    });
}

/* binding */
exports.route = route;
