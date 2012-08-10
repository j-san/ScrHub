
var ScrHub = {};

ScrHub.model = {};

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

ScrHub.model.StoryList = Backbone.Collection.extend({
    model: ScrHub.model.Story,
    url: "/api/" + params.project + "/stories/"
});
ScrHub.model.CurrentSprintStoryList = Backbone.Collection.extend({
    model: ScrHub.model.Story,
    url: "/api/" + params.project + "/sprint/current/stories/"
});

ScrHub.model.Sprint = Backbone.Model.extend({
    idAttribute: "number",
    url: function () {
        return "/api/" + params.project + "/sprint/" + (this.id || "new")
    }
});

ScrHub.model.SprintList = Backbone.Collection.extend({
    model: ScrHub.model.Sprint,
    url: "/api/" + params.project + "/sprints/"
});

