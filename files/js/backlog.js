$(function () {
    var ScrHub = {view: {}, model: {}},
        backlog;



    ScrHub.model.Story = Backbone.Model.extend({
        idAttribute: "number",
        url: function () {
            return "/api/" + params.project + "/story/" + this.id
        }
    });
    ScrHub.model.Sprint = Backbone.Model.extend({
        idAttribute: "number",
        url: function () {
            return "/api/" + params.project + "/sprint/" + this.id
        }
    });

    ScrHub.view.BacklogRow = Backbone.View.extend({
        tagName: "li",
        className: "backlog-line",

        render: function() {
            var self = this;
            this.id = this.el.id = "story-" + this.model.id;
            this.$el.append(this.make("span", {"class": "story-id"}, this.model.id + "."));
            this.$el.append(this.make("span", {"class": "story-title"}, this.model.get("title")));

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
        }
    });

    ScrHub.view.Backlog = Backbone.View.extend({
        el: "#backlog-content",
        events: {
            "click .sprint-assign .backlog-line": "selectStory",
            "click .edit .backlog-line": "editStory"
        },
        views: {},
        render: function () {
            var self = this;
            this.collection.forEach(function(story) {
                var view = new ScrHub.view.BacklogRow({model:story});
                self.$el.append(view.render());
                self.views[view.id] = view;
            });
            return this.$el;
        },
        setSprintAssign: function (sprintNumber) {
            this.setMode("sprint-assign");
            this.sprint = sprintNumber;
            $(".sprint-" + sprintNumber).addClass("hightlight");
        },
        setMode: function (mode) {
            if(this.mode != mode) {
                this.$el.removeClass(this.mode);
                this.mode = mode;
                this.$el.addClass(this.mode);
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
            "click .sprint-select": "selectSprint"
        },
        render: function () {
            var self = this, sprints = $("#sprints");
            this.collection.forEach(function (sprint) {
                sprints.append(self.make("li", {"id": "sprint-" + sprint.id, "class": "sprint-select"}, sprint.get("title")));
            });
            return this.$el;
        },
        selectSprint: function (evt) {
            var matches = evt.currentTarget.id.match(/sprint-(\d+)/);
            console.log(matches);
            backlog.setSprintAssign(matches[1]);
        }
    });



    $.getJSON('/api/' + params.project + '/stories/', function (stories) {
        backlog = new ScrHub.view.Backlog({
            collection: new Backbone.Collection(stories, { model: ScrHub.model.Story })
        });
        backlog.render();
        $("<li class='backlog-line'>add:<input /></li>").appendTo('#backlog-content');
    });

    $.getJSON('/api/' + params.project + '/sprints/', function (sprints) {
        new ScrHub.view.BacklogConfig({
            collection: new Backbone.Collection(sprints, { model: ScrHub.model.Sprint })
        }).render();
    });

});
