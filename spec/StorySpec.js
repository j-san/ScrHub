var Promise = require('mongoose').Promise;
var Model = require('mongoose').Model;
var sinon = require('sinon');


var Story = require('../models/Story');

describe("Story Model", function() {
    it("should use parameter id as primary key", function() {
        var s = new Story({id: 123});
        expect(s._id).toBe(123);
    });

    it("should compute priority", function() {
        s = new Story({
            businessValue: 20,
            difficulty: 5
        });
        expect(s.priority).toBe(4);

        s = new Story({
            businessValue: 5,
            difficulty: 21
        });
        expect(s.priority).toBe(5/21);

        s = new Story({
            difficulty: 21
        });
        expect(s.priority).toBe(0);

        s = new Story({
            businessValue: 10
        });
        expect(s.priority).toBe(0);
    });
});

