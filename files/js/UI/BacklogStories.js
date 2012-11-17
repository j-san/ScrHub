
if (typeof window.ScrHub === "undefined") window.ScrHub = {};
if (typeof ScrHub.view === "undefined") ScrHub.view = {};


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
        
        $(document.body).click(function (evt) {
            if (self.editElem && self.editElem.el !== evt.target && !self.editElem.$el.has(evt.target).length) {
                self.editElem.hideEdit();
                self.editElem = null;
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



ScrHub.view.BacklogRow = Backbone.View.extend({
    tagName: "li",
    className: "backlog-line",
    events: {
        //"blur .story-title": "saveStoryTitle",
        //"blur .story-body": "saveStoryBody",
        //"clickoutside .edit-form": "hideEdit",
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
        this.$el.append(this.make("input", {
            "class": "input-business-value",
            type: "number",
            value: this.model.get("businessValue") || 0
        }));
        this.$el.append(this.make("span", {
            "class": "story-business-value"
        }, this.model.get("businessValue") || "No"));

        this.dificulty = $(this.make("div", {
            "class": "input-difficulty"
        })).appendTo(this.$el);
        this.$el.append(this.make("span", {
            "class": "story-difficulty"
        }, this.model.get("difficulty") || "No"));

        (function fiboSuite(i, prev, fibo) {
            var id = self.id + "-difficulty-" + fibo;
            $(self.make("label", { "for": id }, fibo))
                .prepend(self.make("input", { id: id, name: self.id, type: "radio", value: fibo, checked: self.model.get("difficulty")==fibo }))
                .appendTo(self.dificulty);

            if (i < 6) fiboSuite(i + 1, fibo, prev + fibo);
        }(0, 1, 1));

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

    },/*
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
    },*/
    saveStorySprint: function (evt) {
        var newValue = $(evt.currentTarget).data("number");
        if((!this.model.has("milestone") && newValue != 0) || (this.model.has("milestone") && this.model.get("milestone") != newValue)) {
            this.save({
                "milestone": newValue
            });
        }
    },
    save: function () {
        var self = this,
            title = this.$el.find(".story-title").val(),
            body = this.$el.find(".story-body").val(),
            businessValue = this.$el.find(".input-business-value").val(),
            difficulty = this.$el.find(".input-difficulty :checked").val();

        console.log(difficulty);
        if (title === this.model.get("title")
                && body === this.model.get("body")
                && businessValue == this.model.get("businessValue")
                && difficulty == this.model.get("difficulty")) {
            return;
        }

        this.model.set("title", title);
        this.model.set("body", body);
        //this.model.set("milestone", $(evt.currentTarget).data("number"));
        this.model.set("businessValue", Number(businessValue));
        this.model.set("difficulty", Number(difficulty));


        this.$el.addClass("loading");
        this.$el.removeClass("error");
        this.model.save({}, {
            success: function () {
                self.$el.removeClass("loading");
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
        this.save();
    }
});

