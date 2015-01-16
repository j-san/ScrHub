var winston = require('winston');

process.env.MONGOOSE_DISABLE_STABILITY_WARNING = true;
exports.logger = new winston.Logger();

exports.useDebugLogger = function () {
    exports.logger.add(winston.transports.Console, {
        level: 'debug',
        colorize: true
    });
};

exports.useLogentriesLogger = function(options) {
    exports.logger.add(winston.transports.Console, { level: 'info' });
    exports.logger.add(winston.transports.Logentries, { level: 'info', token: options.token });
};

