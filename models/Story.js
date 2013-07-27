var mongoose = require('mongoose'),
    merge = require('../utils/merge').merge,
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
    if (this.get("difficulty") > 0)
        priority = this.get("businessValue") / this.get("difficulty");
    return priority || 0;
});

StorySchema.virtual('id').set(function (id) {
    this._id = id;
});

StorySchema.static('loadStories', function (stories) {
    var promises = [];
    stories.forEach(function (index, story) {
        promises.push(Story.findById(stories[i].id).then(function (err, fetchedStory) {
            if (!fetchedStory) {
                fetchedStory = new Story();
            }
            _.extend(story, fetchedStory.toObject());
        }));
    });
    return q.all(promises);
});

Story = mongoose.model('Story', StorySchema);
module.exports = Story;

