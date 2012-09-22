$(function () {
    new ScrHub.view.Dashboard({
        collection: new ScrHub.model.CurrentSprintStoryList()
    }).render();
});


ScrHub.view = {};
ScrHub.view.Dashboard = Backbone.View.extend({
    el: "#dashboard",
    render: function () {
        var self = this;
        this.collection.fetch({
            success: function (collection) {
                collection.forEach(function (story) {
                    new ScrHub.view.StoryTicket({model: story}).render();
                });
                self.$el.removeClass("loading");
            }
        });
        return this.$el;
    }
});

ScrHub.view.StoryTicket = Backbone.View.extend({
    events: {
        "click .dashboard-ticket": "edit",
        "click .close": "closeDialog",
        "click #todo #take-in-charge": "takeInChargeStory",
        "click #progress #give-up": "giveUpStory",
        "click #progress #test": "readyForTestStory",
        "click #testing #resume": "resumeStory",
        "click #testing #close": "closeStory"
    },
    render: function () {
        this.todo = $("#todo");
        this.progress = $("#progress");
        this.testing = $("#testing");
        var self = this;

        this.ticket = $(this.make("div", {"class": "dashboard-ticket"}));
        this.ticket.append(this.make("strong", {}, this.model.id + ". " + this.model.get("title")));
        this.$el.append(this.ticket);

        this.pinOnBoard();

        this.detail = $(this.make("div", {"class": "detail modal hide"}));
        $(this.make("div", {"class": "modal-header"})).appendTo(this.detail)
            .append(this.make("button", {
                type: "button", 
                "class": "close"
            }, "x"))           
            .append(this.make("h1", {}, this.model.get("title")));

        $(this.make("div", {"class": "modal-body"}, this.model.get("body") || "no content")).appendTo(this.detail);
        $(this.make("div", {"class": "modal-footer"})).appendTo(this.detail)
            .append(this.make("button", {"id": "take-in-charge"}, "Take in charge"))
            .append(this.make("button", {"id": "give-up"}, "Give up"))
            .append(this.make("button", {"id": "test"}, "Ready for testing"))
            .append(this.make("button", {"id": "resume"}, "Resume"))
            .append(this.make("button", {"id": "close"}, "Close"));

        this.model.on("change:assignee change:labels change:state", function () {
            self.pinOnBoard();
        });
        this.$el.append(this.detail);
        this.detail.modal({show: false});
        return this.$el;
    },
    pinOnBoard: function () {
        if (this.model.get("assignee")) {
            if (!this.$el.find("img").length) {
                this.ticket.prepend(this.make("img", {"class": "avatar", "src": this.model.get("assignee").avatar_url}));
            }
            if (this.model.hasLabel("testing")) {
                this.testing.append(this.$el);
            } else {
                this.progress.append(this.$el);
            }
        } else {
            this.$el.find("img").remove();
            this.todo.append(this.$el);
        }
    },
    edit: function () {
        this.detail.modal("show");
    },
    closeDialog: function () {
        this.detail.modal("hide");
    },
    save: function (data) {
        var self = this;
        this.$el.addClass("loading");
        this.model.save(data, {
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
    takeInChargeStory: function () {
        this.save({"assignee": params.me});
    },
    giveUpStory: function () {
        this.save({"assignee": null});
    },
    readyForTestStory: function () {
        this.model.addLabel("testing");
        this.save();
    },
    resumeStory: function () {
        this.model.removeLabel("testing");
        this.save();
    },
    closeStory: function () {
        this.save({"state": "closed"});
    }
});

/*
ScrHub.view.StoryDialog = Backbone.View.extend({
});
*/
