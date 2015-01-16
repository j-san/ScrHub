

var GithubApi = require('../models/GithubApi'),
    nodemailer = require("nodemailer"),
    _ = require('koa-route'),
    GithubApi = require('../models/GithubApi'),
    logger = require('../utils/logging').logger;

var clientId = process.env.GITHUB_CLIENT_ID,
    cliebtSecret = process.env.GITHUB_SECRET;

function route (app) {
    app.use(function *initGithubClient(next) {
        this.githubClient = new GithubApi(this.session.authToken);
        if (this.request.query.code) {
            yield this.session.$set('accessCode', this.request.query.code);
        }

        try {
            if (this.session.accessCode && !this.session.authToken) {
                logger.debug('get token from github');
                var token = yield this.githubClient.getToken({
                    code: this.query.code,
                    client_id: clientId,
                    client_secret: cliebtSecret,
                });
                this.session.$set('authToken', token.access_token);
                this.githubClient.token = token.access_token;
            }

            yield next;
        } catch(e) {
            if (e.status === 401) {
                logger.debug("redirect to github auth");
                var loginUrl = this.githubClient.loginUrl({
                    client_id: clientId,
                    scope: ['repo'],
                    redirect_uri: this.request.protocol + '://' + this.request.host + this.request.path
                });
                this.session.$unset('accessCode');
                this.session.$unset('authToken');
                this.response.redirect(loginUrl);
            } else {
                throw e;
            }
        }
    });


    app.use(_.get('/', function *home() {
        yield this.render('home');
    }));

    app.use(_.get('/projects/', function* () {
        var results = yield this.githubClient.listProjects();
        yield this.render('project', { projects: results });
    }));

    app.use(_.get('/projects/:name/', function* (name) {
        var projects = yield this.githubClient.org(name).repos();
        yield this.render('project', { projects: projects });
    }));

    app.use(_.get('/project/:user/:name/', function* (user, name) {
        var projectName = user + '/' + name;
        var project = yield this.githubClient.getProject(projectName);
        yield this.render('app', { project: project });
    }));

    app.use(_.get('/feedback/', function* (req, res) {
        yield res.render('feedbackForm');
    }));

    app.use(_.post('/feedback/', function* (req, res) {
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
