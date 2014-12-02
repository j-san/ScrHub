
var GithubApi = require('../models/GithubApi'),
    Story = require('../models/Story'),
    _ = require('underscore'),
    r = require('koa-route'),
    logger = require('../utils/logging').logger,
    q = require('q');

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

    app.use(r.get('/api/:user/:name/sprints/', apiHandler(function sprints (api, req, res, next) {
        var project = req.params.user + '/' + req.params.name;

        return api.listSprints(project).then(function (data) {
            var sprint = GithubApi.findCurrentSprint(data);
            if (sprint) {
                sprint.current = true;
            }
            return sprint;
        });
    })));

    app.use(r.get('/api/:user/:name/sprint/:sprint/stories/', apiHandler(function sprintStories (api, req, res, next) {
        var project = req.params.user + '/' + req.params.name, promise;

        if (req.params.sprint === 'current') {
            promise = api.listSprints(project).then(function (data) {
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
            return api.dashboardStories(project, sprint);
        }).then(function (data) {
            return Story.loadStories(data);
        });
    })));

    app.use(r.get('/api/:user/:name/stories/', apiHandler(function allStories (api, req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        return api.allStories(project).then(function (data) {
            return Story.loadStories(data);
        });
    })));

    app.use(r.put('/api/:user/:name/story/:story', apiHandler(function updateStory (api, req, res, next) {
        var project = req.params.user + '/' + req.params.name;

        return q.all([
            api.updateStory(project, req.params.story, req.body),
            Story.findById(req.body.id).exec().then(function (story) {
                if(story) {
                    story.set(req.body);
                } else {
                    story = new Story(req.body);
                }
                return q.ninvoke(story, 'save');
            }, function (err) {
                var story = new Story(req.body);
                return q.ninvoke(story, 'save');
            })
        ]).then(function (args) {
            return _.extend(args[1], args[0]);
        });
    })));

    app.use(r.post('/api/:user/:name/story/new', apiHandler(function createStory (api, req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        return api.createStory(project, req.body).then(function (issue) {
            issue.project = project;
            return q.ninvoke(new Story(issue), 'save').then(function (story) {
                return _.extend(story, issue);
            });
        });
    })));

    app.use(r.get('/api/:user/:name/labels/', apiHandler(function allLabels (api, req, res, next) {
        var project = req.params.user + '/' + req.params.name;
        return api.allLabels(project);
    })));
}

/* binding */
exports.route = route;
