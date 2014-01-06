
var winston = require('winston'),
    Mail = require('winston-mail').Mail,
    logging = {};

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: 'debug',
            colorize: true
        })
    ]
});

logging.logger = logger;
logging.usePrdLogger = function() {
    logging.logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({ level: 'info' }),
            new (Mail)({
                level: "error",
                host: "smtp.gmail.com",
                username: "robot@scrhub.com",
                password: process.env.ROBOT_PWD,
                from: "Robot <robot@scrhub.com>",
                to: "Jonathan <jonathan@scrhub.com>",
            })
        ]
    });
};
logging.useSilenteLogger = function() {
    logging.logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({ level: 'error' })
        ]
    });
};

logging.logErrors = function(err, req, res, next) {
    logger.error(err.message, err.stack);
    next(err);
};

logging.debugErrorHandler = function(err, req, res, next) {
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

logging.errorHandler = function(err, req, res, next) {
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

module.exports = logging;
