

define(['backbone', 'UI/BacklogRow', 'model/Sprint', 'model/Story'], function (Backbone, BacklogRow, Sprint, Story) {
    fiboSuite = [];
    (function fiboSuiteFunc(prev, fibo) {
        fiboSuite.push(fibo);
        if (fiboSuite.length <= 6) fiboSuiteFunc(fibo, prev + fibo);
    }(1, 1));

    return Backbone.View.extend({
        id: "#product-backlog",
        events: {
            "click #add-story": "addNewStory",
            "click .backlog-line": "editStory"
        },
        bodyTemplate: _.template([
                '<p><button id="add-story">Add new story</button></p>',
                '<ul id="stories-container" class="loading"></ul>'
            ].join('\n')),
        sprintsTemplate: _.template([
                '<ul class="nav nav-pills nav-stacked select-sprint">',
                    '<li id="no-sprint"><a>None</a></li>',
                    '<% sprints.forEach(function (sprint) { %>',
                        '<li id="sprint-<%= sprint.get("number") %>" data-number="<%= sprint.get("number") %>"><a><%= sprint.get("title") %></a></li>',
                    '<% }); %>',
                '</ul>'
            ].join('\n')),
        views: {},
        render: function () {
            var self = this;

            this.$el.html(this.bodyTemplate({}));

            this.stories = this.$("#stories-container");
            this.storiesCollection = Story.getStoryList();
            this.storiesCollection.fetch({
                success: function (collection) {
                    collection.forEach(function(story) {
                        self.addStory(story);
                    });
                    self.stories.removeClass('loading');
                },
                error: function (collection, xhr) {
                    alert(JSON.parse(xhr.responseText).message);
                }
            });

            this.sprintsCollection = Sprint.getSprintList();
            this.sprintsCollection.fetch({
                success: function (collection) {
                    self.sprints = $(self.sprintsTemplate({sprints: collection}));
                },
                error: function (collection, xhr) {
                    alert(JSON.parse(xhr.responseText).message);
                }
            });

            $(document.body).click(function (evt) { // TODO: avoid multiple bind
                if (self.editElem && self.editElem.el !== evt.target && !self.editElem.$el.has(evt.target).length) {
                    self.editElem.hideEdit();
                    self.editElem = null;
                }
            });
            return this.$el;
        },
        addNewStory: function () {
            this.addStory(new Story(), true);
        },
        addStory: function (story, before) {
            var view = new BacklogRow({model:story});
            if (before) {
                this.stories.prepend(view.render());
            } else {
                this.stories.append(view.render());
            }
            this.views[view.id] = view;
        },
        editStory: function (evt) {
            var target = $(evt.currentTarget);
            if(this.editElem && evt.currentTarget === this.editElem.el) {
                return; // click on selected story
            }
            if (this.editElem) {
                this.editElem.hideEdit();
                evt.stopPropagation();
            }
            this.editElem = this.views[target.attr("id")];
            this.editElem.$el.append(this.sprints);
            this.sprints.children().removeClass('active');
            if (this.editElem.model.has("milestone")) {
                this.sprints.find('#sprint-' + this.editElem.model.get("milestone").number).addClass("active");
            } else {
                this.sprints.find('#no-sprint').addClass("active");
            }
            this.editElem.showEdit();
        }
    });
});
