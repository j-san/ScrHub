exports.logErrors = function(err, req, res, next) {
    console.error(err.stack);
    next(err);
}

exports.clientErrorHandler = function(err, req, res, next) {
    if (req.xhr) {
        res.send(500, { error: 'Something blew up!' });
    } else {
        next(err);
    }
}

exports.errorHandler = function(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
}

exports.logRequest = function(req, res, next) {
    console.log(req.method, req.path);
    next();
}
