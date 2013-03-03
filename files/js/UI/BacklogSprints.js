
if (typeof window.ScrHub === "undefined") window.ScrHub = {};
if (typeof ScrHub.view === "undefined") ScrHub.view = {};


ScrHub.view.BacklogSprints = Backbone.View.extend({
    el: "#backlog-sprints",
    events: {
        //"click #add-sprint": "addNewSprint",
        //"click .backlog-line": "editSprint"
    },
    render: function () {
        var self = this, sprints = $("#sprints-container");
        this.collection.fetch({
            success: function (collection) {
                collection.forEach(function (sprint) {
                    var elem = $("<li/>", {
                        "id": "sprint-" + sprint.id,
                        "class": "sprint-line",
                        text: sprint.get("number") + ". " + sprint.get("title")
                    });
                    sprints.append(elem);
                });
                self.trigger("change");
            }
        });
        return this.$el;
    }
});

