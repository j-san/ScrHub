var Promise = require('mongoose').Promise;
var Model = require('mongoose').Model;
var sinon = require('sinon');
var sholud = require('should');

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

    it("should load stories from array", function() {
        Story.findById = sinon.stub();

        var p = new Promise();
        p.complete(new Story({
            id: 1,
            businessValue: 5,
            difficulty: 21
        }));
        Story.findById.withArgs(1).returns(p);

        p = new Promise();
        p.complete(new Story({
            id: 2,
            businessValue: 5,
            difficulty: 21
        }));
        Story.findById.withArgs(2).returns(p);

        p = new Promise();
        p.error(new Error('not found'));
        Story.findById.withArgs(3).returns(p);

        p = new Promise();
        p.complete(new Story({
            id: 42,
            businessValue: 5,
            difficulty: 21
        }));
        Story.findById.withArgs(42).returns(p);

        var s = new Story.loadStories([{
            id: 1
        }, {
            id: 3
        }, {
            id: 42
        }]).then(function() {

        });
    });
});

