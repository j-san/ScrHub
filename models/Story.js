var mongoose = require('mongoose'),
    merge = require('../utils/merge').merge,
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
    if (this.get("difficulty") > 0)
        return this.get("businessValue") / this.get("difficulty");
    return 0;
});

StorySchema.virtual('id').set(function (id) {
    this._id = id;
});

StorySchema.static('sync', function (obj, callback) {
    this.findById(obj.id, function (err, story) {
        if (err) return callback(err);

        if (story) {
            merge (story, obj);
        } else {
            story = new Story(obj);
            // persist new obj if id does not exist yet
        }
        story.save(function end (err, story) {
            if (err) return callback(err);
            
            callback(err, merge(obj, story.toObject()));
        });
    });
});

StorySchema.static('loadStories', function (stories, callback) {
    (function load (i) {
        if (i in stories) {
            Story.findById(stories[i].id, function (err, story) {
                if(story) {
                    merge(stories[i], story.toObject());
                }

                load(i + 1); // recurcive iteration
            });
        } else {
            // end of iteration
            callback(stories);
        }
    }(0));
});
Story = mongoose.model('Story', StorySchema);
module.exports = Story;

