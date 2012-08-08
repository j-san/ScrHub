$(function () {
    var ScrHub = {view: {}, model: {}},
        backlog;



    ScrHub.model.Story = Backbone.Model.extend({
        idAttribute: "number",
        defaults: {
            "title": "",
            "body": "",
            "assignee": null,
            "milestone": null,
            "labels": []
        },
        url: function () {
            return "/api/" + params.project + "/story/" + (this.id || "new")
        }
    });
    ScrHub.model.Sprint = Backbone.Model.extend({
        idAttribute: "number",
        url: function () {
            return "/api/" + params.project + "/sprint/" + (this.id || "new")
        }
    });

    ScrHub.view.BacklogRow = Backbone.View.extend({
        tagName: "li",
        className: "backlog-line",
        events: {
            "blur .edit .story-title": "saveStory"
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

            this.model.on("change:milestone", function (model, newValue) {
                if(self.model.previous("milestone")) {
                    self.$el.removeClass("sprint-" + self.model.previous("milestone").number);
                }

                if (self.model.has("milestone") && typeof self.model.get("milestone") == "object") {
                    self.$el.addClass("sprint-" + self.model.get("milestone").number);
                } else {
                    self.$el.addClass("no-sprint");
                }
            }).trigger("change:milestone");
            
            return this.$el;
        },
        saveStory: function () {
            var self = this, newTitle = this.$el.find(".story-title").val();
            if(this.model.get("title") == newTitle) {
                return;
            }
            console.log(newTitle);
            this.$el.addClass("loading");
            this.model.save({
                "title": newTitle
            }, {
                success: function () {
                    self.$el.removeClass("loading");
                }
            });
        }
    });

    ScrHub.view.Backlog = Backbone.View.extend({
        el: "#backlog-content",
        events: {
            "click .assignment .backlog-line": "selectStory"
        },
        views: {},
        render: function () {
            var self = this;
            this.collection.forEach(function(story) {
                self.addStory(story);
            });
            return this.$el;
        },
        addStory: function (story, before) {
            var view = new ScrHub.view.BacklogRow({model:story});
            if (before) {
                this.$el.prepend(view.render());
            } else {
                this.$el.append(view.render());
            }
            this.views[view.id] = view;
        },
        setSprintAssign: function (sprintNumber) {
            this.setMode("assignment");
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
        },
        editStory: function (evt) {
        },
        selectStory: function (evt) {
            var target = $(evt.currentTarget);
            evt.preventDefault();
            var story = this.views[target.attr("id")].model;
            if (story.has("milestone") && story.get("milestone").number == this.sprint) {
                target.addClass("loading");
                story.save({
                    milestone: null
                }, {
                    success: function () {
                        target.removeClass("hightlight");
                        target.removeClass("loading");
                    },
                    error: function() {
                        target.removeClass("loading");
                        alert('error while saving');
                    }
                });
            } else if (!story.has("milestone")) {
                target.addClass("loading");
                story.save({
                    milestone: this.sprint
                }, {
                    success: function () {
                        target.removeClass("loading");
                        target.addClass("hightlight");
                    },
                    error: function() {
                        target.removeClass("loading");
                        alert('error while saving');
                    }
                });
            } else {
                alert("story already assigned");
            }
        }
    });

    ScrHub.view.BacklogConfig = Backbone.View.extend({
        el: "#backlog-config",
        events: {
            "click #menu-edit": "editMode",
            "click #menu-assignment": "assignmentMode",
            "click .sprint-select": "sprintClick",
            "click #add-story": "addStory"
        },
        render: function () {
            var self = this, sprints = $("#sprints");
            this.collection.forEach(function (sprint) {
                var elem = self.make("li", {
                    "id": "sprint-" + sprint.id,
                    "class": "sprint-select"
                }, sprint.get("number") + ". " + sprint.get("title"));
                sprints.append(elem);
                if (sprint.get("current")) {
                    self.selectSprint(elem, sprint.get("number"));
                }
            });
            this.editMode();
            return this.$el;
        },
        sprintClick: function (evt) {
            var matches = evt.currentTarget.id.match(/sprint-(\d+)/);
            selectSprint(evt.currentTarget, matches[1]);
        },
        selectSprint: function (elem, sprint) {
            $(elem).addClass("selected");
            backlog.setSprintAssign(sprint);
        },
        addStory: function () {
            backlog.addStory(new ScrHub.model.Story(), true);
        },
        editMode: function () {
            backlog.setMode("edit");
            this.setCurrentMenu("edit");
        },
        assignmentMode: function () {
            backlog.setMode("assignment");
            this.setCurrentMenu("assignment");
        },
        setCurrentMenu: function (menu) {
            $("#config-menu li").removeClass("current");
            $("#menu-" + menu).addClass("current");
            $(".config-pane").removeClass("current");
            $("#" + menu + "-config").addClass("current");
        }
    });



    $.getJSON('/api/' + params.project + '/stories/', function (stories) {
        backlog = new ScrHub.view.Backlog({
            collection: new Backbone.Collection(stories, { model: ScrHub.model.Story })
        });
        backlog.render();

        $.getJSON('/api/' + params.project + '/sprints/', function (sprints) {
            new ScrHub.view.BacklogConfig({
                collection: new Backbone.Collection(sprints, { model: ScrHub.model.Sprint })
            }).render();
        });
    });
});
