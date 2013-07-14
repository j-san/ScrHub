
define(['backbone', 'UI/DashboardStoryCard', 'model/Story'], function (Backbone, StoryCard, Story) {

    return Backbone.View.extend({
        id: 'dashboard',
        className: 'row-fluid loading',
        template: _.template([
                '<div id="todo" class="span4 column">',
                    '<h2>Todo</h2>',
                '</div>',
                '<div id="progress" class="span4 column">',
                    '<h2>Progress</h2>',
                '</div>',
                '<div id="testing" class="span4 column">',
                    '<h2>Testing</h2>',
                '</div>',
            ].join('\n')),
        render: function () {
            var self = this;
            var currentSprint = Story.getCurrentSprintStoryList();

            this.$el.html(this.template());
            currentSprint.fetch({
                success: function (collection) {
                    collection.forEach(function (story) {
                        new StoryCard({model: story}).render();
                    });
                    self.$el.removeClass("loading");
                },
                error: function (collection, xhr) {
                    alert(JSON.parse(xhr.responseText).message);
                }
            });
            return this.$el;
        }
    });
});
