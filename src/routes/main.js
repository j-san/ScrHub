

var GithubApi = require('../models/GithubApi'),
    nodemailer = require("nodemailer"),
    logger = require('../utils/logging').logger;


function route (app) {

    /* Connection behavior */

    app.get('*', function getToken (req, res, next) {
        if (!req.session.state) {
            req.session.state = {};
        }

        if (req.param('code')) {
            req.session.state.code = req.param('code');
        }

        if (req.session.state.code && !req.session.state.token) {
            logger.debug('-get token from github');
            new GithubApi(req.session.state).getToken().then(function (data) {
                if (data.access_token) {
                    req.session.state.token = data.access_token;
                } else {
                    logger.error("unexpected github response", data);
                    req.session.state = {};
                }
                next();
            }, function () {
                logger.error("error while getting new token...");
                req.session.state = {};
                next();
            });
        } else {
            next();
        }
    });

    app.get('*', function loadUser (req, res, next) {
        if (req.param("connect")) {
            private(req, res, next);
        }
        if (req.param("disconnect")) {
            req.session.state = {};
        }
        res.locals.path = req.path;
        res.locals.connected = Boolean(req.session.state.token);
        res.locals.user = req.session.state.user || {};
        if (req.session.state.token && !req.session.state.user) {
            new GithubApi(req.session.state).getUser().then(function (user) {
                res.locals.user = req.session.state.user = user;
                next();
            }, function () {
                console.error("error while getting new token...");
                req.session.state = {};
                next();
            });
        } else {
            next();
        }
    });

    function apiHandler (callback) {
        return function (req, res, next) {
            callback(new GithubApi(req.session.state), req, res, next);
        };
    }

    app.get('/', function home (req, res) {
        res.render('home', {
            client_id: process.client_id
        });
    });

    app.get('/projects/', private, apiHandler(function projects (api, req, res) {
        api.listProjects().then(function(projects) {
            res.render('project', { projects: projects });
        });
    }));
    app.get('/projects/:name/', apiHandler(function orgProjects (api, req, res) {
        api.listOrgProjects(req.params.name).then(function(projects) {
            res.render('project', { projects: projects });
        });
    }));

    app.get('/:user/:name/', private, apiHandler(function dashboard (api, req, res) {
        var project = req.params.user + '/' + req.params.name;
        api.getProject(project).then(function(project) {
            res.render('app', {
                project: project
            });
        });
    }));

    app.get('/feedback/', private, function feedback (req, res) {
        res.render('feedbackForm');
    });

    app.post('/feedback/', function sendFeedback (req, res) {
        sendMail(req.body.content);
        res.render('feedbackSent');
    });
}

function private (req, res, next) {
    logger.debug("private request");
    if(!req.session.state.token && !req.param('error')) {
        var redirect_uri = "http://" + process.host + req.path;
        var url = "https://github.com/login/oauth/authorize?client_id=" + process.client_id + "&redirect_uri=" + redirect_uri + "&scope=repo";
        logger.debug("redirect to github auth", url);
        res.redirect(url);
    } else {
        next();
    }
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
