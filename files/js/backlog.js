$(function () {
    var backlog;


    new ScrHub.view.BacklogStories({
        collection: new ScrHub.model.StoryList()
    }).render();

    new ScrHub.view.BacklogSprints({
        collection: new ScrHub.model.SprintList()
    }).render();

});

ScrHub.view = {};


ScrHub.view.BacklogRow = Backbone.View.extend({
    tagName: "li",
    className: "backlog-line",
    events: {
        "blur .edit .story-title": "saveStoryTitle",
        "blur .edit .story-body": "saveStoryBody"
    },

    render: function() {
        var self = this;
        this.id = this.el.id = "story-" + this.model.id;
        this.$el.append(this.make("span", {"class": "story-id"}, this.model.id || "new" + "."));

        this.model.on("change:number", function (model, newValue) {
            self.$el.find(".story-id").text(newValue + ".");
        });
        this.$el.append(this.make("input", {
            "class": "story-title",
            type: "text",
            value: this.model.get("title")
        }));

        $(this.make("textarea", {
            "class": "story-body"
        }, this.model.get("body")))
            .appendTo(this.$el);

        this.setSprint();
        this.model.on("change:milestone", function () {
            self.setSprint();
        });
        
        return this.$el;
    },
    setSprint: function (sprint) {
        if(this.model.previous("milestone")) {
            this.$el.removeClass("sprint-" + this.model.previous("milestone").number);
        }

        if (this.model.has("milestone") && typeof this.model.get("milestone") == "object") {
            this.$el.addClass("sprint-" + this.model.get("milestone").number);
        }
    },
    saveStoryTitle: function () {
        var newValue = this.$el.find(".story-title").val();
        if(this.model.get("title") != newValue) {
            this.save({
                "title": newValue
            });
        }
    },
    saveStoryBody: function () {
        var newValue = this.$el.find(".story-body").val();
        if(this.model.get("body") != newValue) {
            this.save({
                "body": newValue
            });
        }
    },
    save: function (attr, success) {
        var self = this;
        this.$el.addClass("loading");
        this.$el.removeClass("error");
        this.model.save(attr, {
            success: function () {
                self.$el.removeClass("loading");
                if (success) {
                    success();
                }
            },
            error: function () {
                self.$el.removeClass("loading");
                self.$el.addClass("error");
                alert('error while saving');
            }
        });
    },
    showEdit: function () {
        this.$el.addClass("edit-form");
    },
    hideEdit: function () {
        this.$el.removeClass("edit-form");
    }
});

ScrHub.view.BacklogStories = Backbone.View.extend({
    el: "#backlog-stories",
    events: {
        "click #add-story": "addNewStory",
        "click .backlog-line": "editStory"
    },
    views: {},
    render: function () {
        var self = this;
        this.stories = $("#stories-container");
        this.collection.fetch({
            success: function (collection) {
                collection.forEach(function(story) {
                    self.addStory(story);
                });
            }
        });
        return this.$el;
    },
    addNewStory: function () {
        this.addStory(new ScrHub.model.Story(), true);
    },
    addStory: function (story, before) {
        var view = new ScrHub.view.BacklogRow({model:story});
        if (before) {
            this.stories.prepend(view.render());
        } else {
            this.stories.append(view.render());
        }
        this.views[view.id] = view;
    },/*
    setSprint: function (sprintNumber) {
        this.sprint = sprintNumber;
        $(".sprint-" + sprintNumber).addClass("hightlight");
    },
    setMode: function (mode) {
        if (this.mode != mode) {
            this.$el.removeClass(this.mode);
            this.mode = mode;
            this.$el.addClass(this.mode);
            
            if (this.mode == "edit") {
                $(".backlog-line input").prop("disabled", false);
            } else {
                $(".backlog-line input").prop("disabled", true);
            }
        }
    },*/
    editStory: function (evt) {
        var target = $(evt.currentTarget);
        if (this.editingStory) {
            this.editingStory.hideEdit();
        }
        this.editingStory = this.views[target.attr("id")];
        this.editingStory.showEdit();
    },
    selectStory: function (evt) {
        var target = $(evt.currentTarget);
        evt.preventDefault();
        var view = this.views[target.attr("id")],
            story = view.model;
        if (story.has("milestone") && story.get("milestone").number == this.sprint) {
            view.save({
                milestone: null
            }, function () {
                target.removeClass("hightlight");
            });
        } else if (!story.has("milestone")) {
            view.save({
                milestone: this.sprint
            }, function () {
                target.addClass("hightlight");
            });
        } else {
            alert("story already assigned");
        }
    }
});

ScrHub.view.BacklogSprints = Backbone.View.extend({
    el: "#backlog-sprints",
    events: {
        /*"click #menu-edit": "editMode",
        "click #menu-assignment": "assignmentMode",
        "click .sprint-select": "sprintClick",*/
    },
    render: function () {
        var self = this, sprints = $("#sprints-container");
        this.collection.fetch({
            success: function (collection) {
                collection.forEach(function (sprint) {
                    var elem = self.make("li", {
                        "id": "sprint-" + sprint.id,
                        "class": "sprint-select"
                    }, sprint.get("number") + ". " + sprint.get("title"));
                    sprints.append(elem);
                    /*if (sprint.get("current")) {
                        self.selectSprint(elem, sprint.get("number"));
                    }*/
                });
            }
        });
        return this.$el;
    },
    sprintClick: function (evt) {
        var matches = evt.currentTarget.id.match(/sprint-(\d+)/);
        selectSprint(evt.currentTarget, matches[1]);
    },
    selectSprint: function (elem, sprint) {
        $(elem).addClass("selected");
        this.options.backlog.setSprint(sprint);
    }
});

