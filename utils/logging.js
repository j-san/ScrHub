exports.logErrors = function(err, req, res, next) {
    console.error(err.stack);
    next(err);
}

exports.debugErrorHandler = function(err, req, res, next) {
    res.send(500, err);
}

exports.errorHandler = function(err, req, res, next) {
    res.send(500, 'Internal Server Error');
}

exports.logRequest = function(req, res, next) {
    console.log(req.method, req.path);
    next();
}
