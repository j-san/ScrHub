var assert = require('assert'),
    logentries = require('logentries');

module.exports = function(opts) {
    assert(opts.token, 'logentries token is required');

    var logger = logentries.logger({
        token: opts.token
    });

    return function* (next) {
        try {
            logger.info({
                ip:         this.request.ip,
                method:     this.request.method,
                url:        this.request.url,
                length:     this.request.length || null,
                userAgent:  this.request.header['user-agent']
            });
            yield next;

        } catch (e) {
            logger.error(e);

        }
    };
};