var fs = require('fs');
var url = require('url');
/*
var urls = {
    'home': '',
    'connect': 'connect',
    'project': 'project',
    'dashboard': /(.*)\/(.*)\/dashboard/,
    'backlog': /(.*)\/(.*)\/backlog/,
    'files': /static\/(.*)/
};

var urls = {
    : 'home',
    'connect': 'connect',
    'project': 'project',
    '(.*)/(.*)/dashboard', 'dashboard',
    'backlog': /(.*)\/(.*)\/backlog/,
    : /static\/(.*)/
};
*/
views = {
    '^/$': function home (req, res) {
        outputFile(res, 'pages/home.html');
    },
    '/connect/': function connect (req, res) {
        console.log(req.query['code']);
        outputFile(res, 'pages/home.html');
    },
    '/project/': function project (req, res) {
        outputError(res, 'In progress', 501);
    },
    '/(.*)/(.*)/dashboard/': function dashboard (req, res, projOwner, projName) {},
    '/(.*)/(.*)/backlog/': function backlog (req, res, projOwner, projName) {},
    '(.*)': function fileServe (req, res, file) {
        outputFile(res, 'files/' + file);
    }
};

function route (req, res) {
    var params, parcedUrl = url.parse(req.url, true), path = parcedUrl.pathname;
    console.log('Incoming Request for href: ' + parcedUrl.href);
    console.log('path: ' + path);

    req.path = path;
    req.query = parcedUrl.query;

    for (var viewUrl in views) {
        params = viewUrl.match(path);
        if (params && params.length) {
            console.log("match is " + viewUrl + " params:",params.slice(1));
            return views[viewUrl].apply(req, [req, res].concat(params.slice(1)));
        }
    }
    output404(res);
}

function output404 (res, message, code) {
    outputError(res, 'Not Found', 404);
}

function outputError (res, message, code) {
    if(!code) {
        code = 500;
    }
    res.writeHead(code);
    res.end(message);
}

function response (res, content, type) {
    if(!type) {
        type = 'text/html';
    }
    res.writeHead(200, {'Content-Type': type});
    res.end(content, 'utf-8');
}

function outputFile (res, file) {
    fs.readFile(file, function(error, content) {
        var type = 'text/plain';

        if (error) {
            throw Error(error);
        }

        if (/.*\.js/.test(file)) {
            type = 'text/javascript';
        }
        if (/.*\.css/.test(file)) {
            type = 'text/css';
        }
        if (/.*\.html/.test(file)) {
            type = 'text/html';
        }

        response(res, content, type);
    });
}

exports.route = route;
