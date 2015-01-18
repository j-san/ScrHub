
var GithubApi = require('../models/GithubApi'),
    Story = require('../models/Story'),
    _ = require('underscore'),
    r = require('koa-route');

function route (app) {
    'use strict';

    app.use(r.get('/api/:user/:name/sprints/', function* (user, name) {
        var sprints, project = user + '/' + name;

        sprints = yield this.githubClient.listSprints(project);
        var sprint = GithubApi.findCurrentSprint(sprints);
        if (sprint) {
            sprint.current = true;
        }
        this.body = sprint;
    }));

    app.use(r.get('/api/:user/:name/sprint/:sprint/stories/', function* (user, name, sprint) {
        var project = user + '/' + name, stories, sprints;

        if (sprint === 'current') {
            sprints = yield this.githubClient.listSprints(project);
            if (sprints.length) {
                sprint = GithubApi.findCurrentSprint(sprints).number;
            }
        }
        stories = yield this.githubClient.dashboardStories(project, sprint);
        this.body = yield Story.loadStories(stories);
    }));

    app.use(r.get('/api/:user/:name/stories/', function* allStories (user, name) {
        var project = user + '/' + name;
        var stories = yield this.githubClient.allStories(project);
        this.body = yield Story.loadStories(stories);
    }));

    app.use(r.put('/api/:user/:name/story/:number', function* (user, name, number) {
        var project = user + '/' + name;
        var storyId = this.request.body.id;

        var githubStory = yield this.githubClient.updateStory(project, number, this.request.body);
        var formerStory = yield Story.findById(storyId).exec();

        if(formerStory) {
            formerStory.set(this.request.body);
        } else {
            formerStory = new Story(this.request.body);
        }
        yield formerStory.save();

        this.body = _.extend(formerStory, githubStory);
    }));

    app.use(r.post('/api/:user/:name/story/new', function* (user, name) {
        var project = user + '/' + name;
        var issue = yield this.githubClient.createStory(project, this.body);
        issue.project = project;
        var story =  new Story(issue);
        yield story.save();
        this.body = _.extend(story, issue);
    }));

    app.use(r.get('/api/:user/:name/labels/', function* (user, name) {
        var project = user + '/' + name;
        this.body = yield this.githubClient.allLabels(project);
    }));

    app.use(r.get('/api/settings/', function* () {
        this.body = {};
        this.body.app = {
            env: app.env,
            version: app.verison
        };
        this.body.user = yield this.githubClient.getUser();
    }));
}

/* binding */
exports.route = route;
