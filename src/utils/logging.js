var winston = require('winston');

process.env.MONGOOSE_DISABLE_STABILITY_WARNING = true;
exports.logger = new winston.Logger();

exports.useDebugLogger = function () {
    exports.logger.add(winston.transports.Console, {
        level: 'debug',
        colorize: true
    });
};

exports.useLiveLogger = function() {
    exports.logger.add(winston.transports.Console, {
        level: 'info',
        colorize: false
    });
};

