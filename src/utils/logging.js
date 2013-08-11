exports.logErrors = function(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    next(err);
};

exports.debugErrorHandler = function(err, req, res, next) {
    res.statusCode = 500;

    res.format({
        text: function(){
            res.send(err.stack);
        },
        json: function(){
            res.json({ message: err.message, stack: err.stack });
        }
    });
};

exports.errorHandler = function(err, req, res, next) {
    res.statusCode = 500;

    res.format({
        text: function(){
            res.send('Internal Server Error');
        },
        html: function(){
            res.send('<h1>Internal Server Error</h1>');
        },
        json: function(){
            res.json({ message: 'Internal Server Error' });
        }
    });
};

exports.logRequest = function(req, res, next) {
    console.log(req.method, req.path);
    next();
};
