var modal;

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
    className: "dashboard-ticket",
    events: {
        "click": "edit",
    },
    render: function () {
        this.todo = $("#todo");
        this.progress = $("#progress");
        this.testing = $("#testing");
        var self = this;

        this.$el.append(this.make("h3", {}, this.model.id + ". " + this.model.get("title")));

        this.pinOnBoard();

        this.model.on("change:assignee change:labels change:state", function () {
            self.pinOnBoard();
        });
        return this.$el;
    },
    pinOnBoard: function () {
        if (this.model.get("assignee")) {
            if (!this.$el.find("img").length) {
                this.$el.prepend(this.make("img", {"class": "avatar", "src": this.model.get("assignee").avatar_url}));
            }
            if (this.model.hasLabel("testing")) {
                this.testing.append(this.$el);
            } else if (this.model.get("state") === "closed") {
                this.$el.remove();
            } else {
                this.progress.append(this.$el);
            }
        } else {
            this.$el.find("img").remove();
            this.todo.append(this.$el);
        }
    },
    edit: function () {
        this.modal = new ScrHub.view.StoryDialog({ sender: this, model: this.model });
        this.modal.render();
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
        this.modal.closeDialog();
    }

});


ScrHub.view.StoryDialog = Backbone.View.extend({
    events: {
        "click .close": "closeDialog",
        "click #todo #take-in-charge": "takeInChargeStory",
        "click #progress #give-up": "giveUpStory",
        "click #progress #test": "readyForTestStory",
        "click #testing #resume": "resumeStory",
        "click #testing #close": "closeStory"
    },
    render: function () {
        this.sender = this.options.sender;
        this.detail = $(this.make("div", {"class": "detail modal hide"}));
        $(this.make("div", {"class": "modal-header"})).appendTo(this.detail)
            .append(this.make("button", {
                type: "button", 
                "class": "close"
            }, "x"))
            .append(this.make("h3", {}, this.model.get("title")));

        $(this.make("div", {"class": "modal-body"}))
            .append(this.make("button", {"id": "take-in-charge"}, "Take in charge"))
            .append(this.make("button", {"id": "give-up"}, "Give up"))
            .append(this.make("button", {"id": "test"}, "Processed"))
            .append(this.make("button", {"id": "resume"}, "Resume"))
            .append(this.make("button", {"id": "close"}, "Close"))
            .append(this.make("div", {"class": "story-body"},  this.model.get("body") || "no content"))
            .appendTo(this.detail);
        this.$el.append(this.detail);
        this.detail.modal();
        this.$el.appendTo(this.sender.$el.closest(".column"));
    },
    closeDialog: function () {
        this.detail.modal("hide");
        this.detail.remove();
    },
    takeInChargeStory: function () {
        this.sender.save({"assignee": params.me});
    },
    giveUpStory: function () {
        this.sender.save({"assignee": null});
    },
    readyForTestStory: function () {
        this.model.addLabel("testing");
        this.sender.save();
    },
    resumeStory: function () {
        this.model.removeLabel("testing");
        this.sender.save();
    },
    closeStory: function () {
        this.sender.save({"state": "closed"});
    }
});

