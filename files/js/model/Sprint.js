
if (typeof window.ScrHub === "undefined") window.ScrHub = {};
if (typeof ScrHub.model === "undefined") ScrHub.model = {};


ScrHub.model.Sprint = Backbone.Model.extend({
    idAttribute: "number",
    defaults: {
        "title": "",
        "state": "open",
        "description": "",
        "due_on": null,
    },
    toJSON: function () {
        var obj = {};
        for (var attr in this.defaults) {
            obj[attr] = this.get(attr);
        }
        return obj;
    },
    url: function () {
        return "/api/" + params.project + "/sprint/" + (this.id || "new")
    }
});

ScrHub.model.SprintList = Backbone.Collection.extend({
    model: ScrHub.model.Sprint,
    url: "/api/" + params.project + "/sprints/"
});

ScrHub.model.CurrentSprintStoryList = Backbone.Collection.extend({
    model: ScrHub.model.Story,
    url: "/api/" + params.project + "/sprint/current/stories/"
});

