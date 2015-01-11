var mongoose = require('mongoose'),
    _ = require('underscore'),
    q = require('q'),
    StorySchema = new mongoose.Schema({
        _id: Number,
        number: Number,
        project: String,
        difficulty: Number,
        businessValue: Number
    },{
        toObject: {
            virtuals: true
        }
    }),
    Story;

StorySchema.virtual('priority').get(function () {
    var priority;
    if (this.get("difficulty") > 0) {
        priority = this.get("businessValue") / this.get("difficulty");
    }
    return priority || 0;
});

StorySchema.virtual('id').set(function (id) {
    this._id = id;
});

StorySchema.method('toGithubObject', function () {
    var obj = this.toObject();
    delete obj.difficulty;
    delete obj.businessValue;
    delete obj.priority;
    delete obj.project;
    return obj;
});

StorySchema.static('loadStories', function (stories) {
    var promises = [];
    stories.forEach(function (story) {
        promises.push(Story.findById(story.id)
            .exec().then(function (fetchedStory) {
                if (fetchedStory) {
                    return _.extend(story, fetchedStory.toObject());
                } else {
                    return story;
                }
            })
        );
    });
    return q.all(promises);
});

Story = mongoose.model('Story', StorySchema);
module.exports = Story;

