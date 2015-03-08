
var mongoose = require('mongoose'),
    initApp = require('../src/app'),
    nock = require('nock'),
    client = require('co-supertest');

exports.database = function() {
    before(function *() {
        yield function (done) {
            mongoose.connect('mongodb://localhost/scrhub-test', done);
        };
        this.app = initApp(mongoose.connection.db);
    });

    after(function *() {
        yield function (done) {
            mongoose.connection.db.dropDatabase(done);
        };
        yield function (done) {
            mongoose.disconnect(done);
        };
    });
};
exports.client = function() {
    before(function *() {
        this.app = initApp(mongoose.connection.db);
    });
    beforeEach(function *() {
        this.client = client(this.app.listen());
    });
};
exports.nock = function() {
    before(function *() {
        nock.disableNetConnect();
        nock.enableNetConnect(/(127.0.0.1.*|localhost.*)/);
    });
};
