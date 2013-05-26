
if (typeof window.ScrHub === "undefined") window.ScrHub = {};
if (typeof ScrHub.view === "undefined") ScrHub.view = {};

fiboSuite = [];
(function fiboSuiteFunc(prev, fibo) {
    fiboSuite.push(fibo);
    if (fiboSuite.length <= 6) fiboSuiteFunc(fibo, prev + fibo);
}(1, 1));

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
            },
            error: function (collection, xhr) {
                alert(JSON.parse(xhr.responseText).message);
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
        this.sprints = $("<ul/>", {"class": "nav nav-pills nav-stacked select-sprint"});
        $("<li/>", {"id": "no-sprint"})
            .append($("<a/>", {text: "None"}))
            .appendTo(self.sprints);
        sprints.forEach(function (sprint) {
            $("<li/>", {"id": "sprint-" + sprint.get("number")})
                .append($("<a/>", {text: sprint.get("title")}))
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

    storyRowTemplate: _.template([
            '<span class="story-id"><%= number %></span>',
            '<span class="story-title"><input type="text" value="<%= title %>" /></span>',
            '<input class="input-business-value" type="number" value="<%= businessValue %>"/>',
            '<span class="story-business-value"><%= businessValue || "-" %></span>',
            '<div class="input-difficulty" data-toggle="buttons-radio"><% _.each(fiboSuite, function(fibo, i) { %>',
                '<input id="<%= number %>-difficulty-<%= fibo %>" name="<%= number %>" type="radio" value="<%= fibo %>" <%= difficulty===fibo?"checked":"" %> />',
                '<label for="<%= number %>-difficulty-<%= fibo %>" class="btn <%= difficulty===fibo?"active":"" %>"><%= fibo %></label>',
            '<% }); %></div>',
            '<span class="story-difficulty"><%= difficulty || "-" %></span>',
            '<span class="story-priority"><%= priority || "-" %></span>',
            '<span class="story-body"><textarea><%= body %></textarea></span>',
            '<span class="story-sprint"><%= body %></span>'
        ].join('\n')),

    render: function() {
        var self = this;

        console.log("+++", this.storyRowTemplate(this.model.attributes), "+++");
        this.$el.html(this.storyRowTemplate(this.model.attributes));
        this.id = this.el.id = "story-" + this.model.id;
        // this.$el.append($("<span/>", {"class": "story-id", text: this.model.id || "new" + "."}));

        this.model.on("change:number", function (model, newValue) {
            self.$el.find(".story-id").text(newValue + ".");
        });

        // $("<input/>", {
        //     type: "text",
        //     value: this.model.get("title")
        // }).appendTo(this.$el).wrap('<span class="story-title"/>');

        // $("<input/>", {
        //     "class": "input-business-value",
        //     type: "number",
        //     value: this.model.get("businessValue") || 0
        // }).appendTo(this.$el);

        // $("<span/>", {
        //     "class": "story-business-value",
        //     text: this.model.get("businessValue") || "No"
        // }).appendTo(this.$el);

        // this.dificulty = $("<div/>", {
        //     "class": "input-difficulty"
        // }).appendTo(this.$el);

        // $("<span/>", {
        //     "class": "story-difficulty",
        //     text: this.model.get("difficulty") || "No"
        // }).appendTo(this.$el);

        // (function fiboSuite(i, prev, fibo) {
        //     var id = self.id + "-difficulty-" + fibo;
        //     $("<label/>", { "for": id, text: fibo})
        //         .prepend($("<input/>", {
        //             id: id,
        //             name: self.id,
        //             type: "radio",
        //             value: fibo,
        //             checked: self.model.get("difficulty")==fibo
        //         }))
        //         .appendTo(self.dificulty);

        //     if (i < 6) fiboSuite(i + 1, fibo, prev + fibo);
        // }(0, 1, 1));

        // $("<textarea/>", {
        //     text: this.model.get("body")
        // })
        // .appendTo(this.$el).wrap('<span class="story-body"/>');

        // this.sprint = $("<span/>", {
        //     "class": "story-sprint"
        // }).appendTo(this.$el);
        this.sprint = this.$(".story-sprint");

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
        if((!this.model.has("milestone") && newValue) || (this.model.has("milestone") && this.model.get("milestone") != newValue)) {
            this.model.set("milestone", newValue);
            this.syncModel();
        }
    },
    save: function () {
        var title = this.$el.find(".story-title").find("input").val(),
            body = this.$el.find(".story-body").find("textarea").val(),
            businessValue = this.$el.find(".input-business-value").val(),
            difficulty = this.$el.find(".input-difficulty :checked").val();

        if (title === this.model.get("title") &&
                body === this.model.get("body") &&
                businessValue == this.model.get("businessValue") &&
                difficulty == this.model.get("difficulty")) {
            return;
        }

        this.model.set("title", title);
        this.model.set("body", body);
        //this.model.set("milestone", $(evt.currentTarget).data("number"));
        this.model.set("businessValue", Number(businessValue));
        this.model.set("difficulty", Number(difficulty));
        this.syncModel();
    },
    syncModel: function () {
        var self = this;
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

