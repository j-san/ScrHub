$(function () {
    
    new ScrHub.view.Dashboard({
        collection: new ScrHub.model.CurrentSprintStoryList()
    }).render();
    /*
    $.getJSON('/api/' + params.project + '/sprints/', function (sprints) {
        var current;
        for (var i in sprints) {
            if (sprints[i].current) {
                current = sprints[i];
            }
        }
    });
    $.getJSON('/api/' + params.project + '/sprint/current/stories/', function (stories) {
        var todo = $("#todo"), progress = $("#progress"), story, ticket;
        for (var i in stories) {
            story = stories[i];
            ticket = $("<div class='dashboard-ticket'><h3>" + story.number + ". " + story.title + "</h3></div>");
            if (!story.assignee) {
                todo.append(ticket);
            } else { // if not testing label
                progress.append(ticket);
                ticket.prepend("<img src='" + story.assignee.avatar_url + "' />");
            }
        }
    });
    */
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
        var todo = $("#todo"), progress = $("#progress"), self = this;
        this.$el.append(this.make("h3", {}, this.model.id + ". " + this.model.get("title")));
        if (this.model.get("assignee")) {
            this.$el.prepend("<img src='" + this.model.get("assignee").avatar_url + "' />");
            // if not testing label
                progress.append(this.$el);
        } else { 
            todo.append(this.$el);
        }
        return this.$el;
    },
    edit: function () {
        console.log("edit");
    }
});

