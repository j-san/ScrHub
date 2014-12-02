

var GithubApi = require('../models/GithubApi'),
    nodemailer = require("nodemailer"),
    github = require('octonode'),
    _ = require('koa-route'),
    q = require("q"),
    logger = require('../utils/logging').logger;

function route (app) {

    var authUrl = github.auth.config({
        id: process.env.GITHUB_CLIENT_ID || 'f48190b0a23185d38240',
        secret: process.env.GITHUB_SECRET
    }).login(['repo']);

    app.use(function *initAuthToken(next) {
        if (this.request.query.code) {
            this.session.$set('accessCode', this.request.query.code);
        }

        if (this.session.accessCode && !this.session.authToken) {
            logger.debug('get token from github');
            try {
                var token = yield q.ninvoke(github.auth, 'login', this.query.code);
                this.session.$set('authToken', token);
            } catch(err) {
                console.error(err.trace);
                this.session.accessCode = null;
                this.session.authToken = null;
            }
        }

        yield next;
    });


    app.use(_.get('/', function *home() {
        yield this.render('home', {
            client_id: process.client_id
        });
    }));

    app.use(function *authenticationRequired(next) {

        if(!this.session.authToken && !this.request.query.error) {

            logger.debug('private request');
            this.response.redirect(authUrl + '&redirect_uri=' + this.request.path);
        } else {
            this.ghClient = github.client(this.session.authToken);
            yield next;
        }
    });

    app.use(_.get('/projects/', function *projectList () {
        var results = yield q.ninvoke(this.ghClient.me(), 'repos');
        yield this.render('project', { projects: results[0] });
    }));

    app.use(_.get('/projects/:name/', function *orgProjects (api, req, res) {
        var projects = yield this.ghClient.org(req.params.name).repos();
        yield this.render('project', { projects: projects });
    }));

    app.use(_.get('/:user/:name/', function *dashboard (user, name) {

        var projectName = user + '/' + name;
        var project = yield q.ninvoke(this.ghClient, 'repo', projectName);
        console.log(project);
        yield this.render('app', {
            project: project
        });
    }));

    app.use(_.get('/feedback/', function *feedback (req, res) {
        yield res.render('feedbackForm');
    }));

    app.use(_.post('/feedback/', function *sendFeedback (req, res) {
        sendMail(req.body.content);
        yield res.render('feedbackSent');
    }));
}

/* Sending mail */
function sendMail(content) {
    var smtpTransport = nodemailer.createTransport("SMTP", {
        service: "Gmail",
        auth: {
            user: "robot@scrhub.com",
            pass: process.env.ROBOT_PWD
        }
    });

    logger.debug(content);
    smtpTransport.sendMail({
        from: "Robot <robot@scrhub.com>",
        to: "Jonathan <jonathan@scrhub.com>",
        subject: "Feedback about Scrum Hub",
        text: content,
    }, function (error, response) {
        if (error) {
            logger.error(error);
        } else {
            logger.debug("Message sent: " + response.message);
        }

        smtpTransport.close();
    });
}

/* binding */
exports.route = route;
