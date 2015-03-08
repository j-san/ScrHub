var mongoose = require('mongoose'),
    _ = require('underscore');


var StorySchema = new mongoose.Schema({
    _id: Number,
    number: Number,
    project: String,
    difficulty: Number,
    businessValue: Number
},{
    toObject: {
        virtuals: true
    }
});

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
    return stories.map(function (story) {
        return Story.findById(story.id)
            .exec().then(function (fetchedStory) {
                if (fetchedStory) {
                    return _.extend(story, fetchedStory.toObject());
                } else {
                    return story;
                }
            });
    });
});

var Story = mongoose.model('Story', StorySchema);
module.exports = Story;

