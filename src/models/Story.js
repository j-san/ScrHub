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

StorySchema.static('loadStories', function (stories) {
    var promises = [];
    stories.forEach(function (story, index) {
        console.log(story);
        promises.push(
            Story.findById(story.id)
                .then(function (fetchedStory) {
                    _.extend(story, fetchedStory.toObject());
                }, function (err) {})
        );
    });
    return q.all(promises);
});

Story = mongoose.model('Story', StorySchema);
module.exports = Story;

