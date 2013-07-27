

var GithubApi = require('../models/GithubApi'),
    requestApi = GithubApi.requestApi,
    nodemailer = require("nodemailer");


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
            console.log('-get token from github');
            new GithubApi(req.session.state).getToken(function (data) {
                if (data.access_token) {
                    req.session.state.token = data.access_token;
                } else {
                    console.log("-unexpected github response", data);
                    req.session.state = {};
                }
                next();
            }).on("error", function () {
                console.log("error while getting new token...");
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
            new GithubApi(req.session.state).getUser(function (user) {
                res.locals.user = req.session.state.user = user;
                next();
            }).on("error", function () {
                console.log("error while getting new token...");
                req.session.state = {};
                next();
            });
        } else {
            next();
        }
    });
    app.get('/', function home (req, res) {
        res.render('home', {
            client_id: process.client_id
        });
    });

    app.get('/projects/', private, function projects (req, res) {
        requestApi(req, res).listProjects(function(projects) {
            res.render('project', { projects: projects });
        });
    });
    app.get('/projects/:name/', function orgProjects (req, res) {
        requestApi(req, res).listOrgProjects(req.params.name, function(projects) {
            res.render('project', { projects: projects });
        });
    });

    app.get('/:user/:name/', private, function dashboard (req, res) {
        var project = req.params.user + '/' + req.params.name;
        requestApi(req, res).getProject(project, function(project) {
            res.render('app', {
                project: project
            });
        });
    });

    app.get('/feedback/', private, function feedback (req, res) {
        res.render('feedbackForm');
    });

    app.post('/feedback/', function sendFeedback (req, res) {
        sendMail(req.body.content);
        res.render('feedbackSent');
    });


}

function private (req, res, next) {
    console.log("-private request");
    if(!req.session.state.token && !req.param('error')) {
        var redirect_uri = "http://" + process.host + req.path;
        var url = "https://github.com/login/oauth/authorize?client_id=" + process.client_id + "&redirect_uri=" + redirect_uri + "&scope=repo";
        console.log("-redirect to github auth", url);
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

    console.log(content);
    smtpTransport.sendMail({
        from: "Rugbite <robot@scrhub.com>",
        to: "Jonathan <jonathan@scrhub.com>",
        subject: "Feedback about Scrum Hub",
        text: content,
    }, function (error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
        }

        smtpTransport.close();
    });
}

/* binding */
exports.route = route;
