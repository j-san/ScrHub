var Promise = require('mongoose').Promise;
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
        Story.findById.withArgs(1).returns({ exec: function () { return p; }});

        p = new Promise();
        p.complete(new Story({
            id: 2,
            businessValue: 6,
            difficulty: 21
        }));
        Story.findById.withArgs(2).returns({ exec: function () { return p; }});

        p = new Promise();
        p.error(new Error('not found'));
        Story.findById.withArgs(3).returns({ exec: function () { return p; }});

        p = new Promise();
        p.complete(new Story({
            id: 42,
            businessValue: 7,
            difficulty: 21
        }));
        Story.findById.withArgs(42).returns({ exec: function () { return p; }});

        var stories = [{
            id: 1
        }, {
            id: 3
        }, {
            id: 42
        }];
        var s = new Story.loadStories(stories)
                .then(function() {
                    stories[0].should.have.property('businessValue', 5);
                    stories[1].should.not.have.property('businessValue');
                    stories[2].should.not.have.property('businessValue', 7);
                    Story.findById.called.sould.be.true();
                    Story.findById.callCount.sould.be.eql(3);
                });
    });
});

