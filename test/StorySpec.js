require('co-mocha');

var Story = require('../src/models/Story');


describe("Story Model", function() {
    require('TestSetup').database();

    it("should use parameter id as primary key", function () {
        var s = new Story({id: 123});
        s.save();
        s.should.have.property('_id', 123);
    });

    it("should compute priority", function () {
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

    it("should load stories from array", function *() {

        var s1 = new Story({
            id: 1,
            businessValue: 5,
            difficulty: 21
        });

        var s2 = new Story({
            id: 2,
            businessValue: 6,
            difficulty: 21
        });

        var s3 = new Story({
            id: 42,
            businessValue: 7,
            difficulty: 21
        });

        yield [
            s1.save(),
            s2.save(),
            s3.save()
        ];

        var stories = [{
            id: 1
        }, {
            id: 3
        }, {
            id: 42
        }];
        stories = yield Story.loadStories(stories);

        stories.should.have.lengthOf(3);
        stories[0].should.have.property('businessValue', 5);
        stories[1].should.not.have.property('businessValue');
        stories[2].should.have.property('businessValue', 7);
    });
});


