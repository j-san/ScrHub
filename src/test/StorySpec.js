var Promise = require('mongoose').Promise;
var Model = require('mongoose').Model;
var sinon = require('sinon');
var sinon = require('should');

var Story = require('../models/Story');

describe("Story Model", function() {
    it("should use parameter id as primary key", function() {
        var s = new Story({id: 123});
        s.should.have.property('_id', 123);
    });

    it("should compute priority", function() {
        var s = new Story({
            businessValue: 20,
            difficulty: 5
        });
        s.should.have.property('priority', 4);

        s = new Story({
            businessValue: 5,
            difficulty: 21
        });
        s.should.have.property('priority', 5/21);

        s = new Story({
            difficulty: 21
        });
        s.should.have.property('priority', 0);

        s = new Story({
            businessValue: 10
        });
        s.should.have.property('priority', 0);
    });
});

