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
            },
            error: function (collection, xhr) {
                alert(JSON.parse(xhr.responseText).message);
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

        this.$el.append($("<h3/>", {text: this.model.id + ". " + this.model.get("title")}));

        this.pinOnBoard();

        this.model.on("change:assignee change:labels change:state", function () {
            self.pinOnBoard();
        });
        return this.$el;
    },
    pinOnBoard: function () {
        if (this.model.get("assignee")) {
            if (!this.$el.find("img").length) {
                this.$el.prepend($("<img/>", {"class": "avatar", "src": this.model.get("assignee").avatar_url}));
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
        this.detail = $($("<div/>", {"class": "detail modal hide"}));
        $($("<div/>", {"class": "modal-header"})).appendTo(this.detail)
            .append($("<button/>", {type: "button", "class": "close", text: "x"}))
            .append($("<h3/>", {text: this.model.get("title")}));

        $($("<div/>", {"class": "modal-body"}))
            .append($("<button/>", {"id": "take-in-charge", text: "Take in charge"}))
            .append($("<button/>", {"id": "give-up", text: "Give up"}))
            .append($("<button/>", {"id": "test", text: "Processed"}))
            .append($("<button/>", {"id": "resume", text: "Resume"}))
            .append($("<button/>", {"id": "close", text: "Close"}))
            .append($("<div/>", {"class": "story-body", text: this.model.get("body") || "no content"}))
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

