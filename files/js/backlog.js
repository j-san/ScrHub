$(function () {
    var stories = new ScrHub.view.BacklogStories({
        collection: new ScrHub.model.StoryList()
    })
    stories.render();

    var sprints = new ScrHub.view.BacklogSprints({
        collection: new ScrHub.model.SprintList()
    })
    sprints.render();

    sprints.on("change", function () {
        stories.refreshSprints(sprints.collection.models);
    });
});

ScrHub.view = {};


ScrHub.view.BacklogRow = Backbone.View.extend({
    tagName: "li",
    className: "backlog-line",
    events: {
        "blur .story-title": "saveStoryTitle",
        "blur .story-body": "saveStoryBody",
        // "clickoutside .edit-form": "hideEdit",
        "click .select-sprint li": "saveStorySprint"
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
        }, this.model.get("body"))).appendTo(this.$el);
        this.sprint = $(this.make("span", {
            "class": "story-sprint"
        })).appendTo(this.$el);

        this.setSprint();
        this.model.on("change:milestone", function () {
            self.setSprint();
        });
        
        return this.$el;
    },
    setSprint: function () {
        this.$el.find('.select-sprint li').removeClass("active");
        if (this.model.has("milestone") && typeof this.model.get("milestone") == "object") {
            this.sprint.html(this.model.get("milestone").title).addClass('active');
            this.$el.find('#sprint-' + this.model.get("milestone").number).addClass("active");
        } else if(!this.model.has("milestone")) {
            this.sprint.html("none").removeClass('active');
            this.$el.find('#no-sprint').addClass("active");
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
    saveStorySprint: function (evt) {
        var newValue = $(evt.currentTarget).data("number");
        if((!this.model.has("milestone") && newValue != 0) || (this.model.has("milestone") && this.model.get("milestone") != newValue)) {
            this.save({
                "milestone": newValue
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
                alert('error while saving, check if you are connected');
            }
        });
    },
    showEdit: function () {
        this.$el.addClass("edit-form");
    },
    hideEdit: function () {
        this.$el.removeClass("edit-form");
        console.log("end edit");
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
        $(document.body).click(function () {
            self.unselectStory();
        });
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
    refreshSprints: function (sprints) {
        var self = this;
        this.sprints = $(this.make("ul", {"class": "nav nav-pills nav-stacked select-sprint"}));
        $(self.make("li", {"id": "no-sprint"}))
            .append(self.make("a", {}, "None"))
            .appendTo(self.sprints);
        sprints.forEach(function (sprint) {
            $(self.make("li", {"id": "sprint-" + sprint.get("number")}))
                .append(self.make("a", {}, sprint.get("title")))
                .data("number",sprint.get("number"))
                .appendTo(self.sprints);
        });
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
    },
    editStory: function (evt) {
        var target = $(evt.currentTarget);
        if(this.editingStory && target.attr("id") == this.editingStory.id) {
            return;
        }
        console.log("edit");
        if (this.editingStory) {
            this.editingStory.hideEdit();
        }
        this.editingStory = this.views[target.attr("id")];
        this.editingStory.$el.append(this.sprints);
        this.sprints.children().removeClass('active');
        if (this.editingStory.model.has("milestone")) {
            this.sprints.find('#sprint-' + this.editingStory.model.get("milestone").number).addClass("active");
        } else {
            this.sprints.find('#no-sprint').addClass("active");
        }
        this.editingStory.showEdit();
    },
    unselectStory: function (evt) {
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
                self.trigger("change");
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

