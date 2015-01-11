
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
                ssl: true,
                from: "robot@scrhub.com",
                to: "jonathan@scrhub.com",
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

module.exports = logging;
