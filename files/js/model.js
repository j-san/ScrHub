
var ScrHub = {};

ScrHub.model = {};

ScrHub.model.Story = Backbone.Model.extend({
    idAttribute: "number",
    defaults: {
        "title": "",
        "body": "",
        "state": "open",
        "assignee": null,
        "milestone": null,
        "labels": []
    },
    url: function () {
        return "/api/" + params.project + "/story/" + (this.id || "new")
    },
    toJSON: function () {
        var obj = {};
        for (var attr in this.defaults) {
            obj[attr] = this.get(attr);
        }
        if (obj.assignee && obj.assignee.login) {
            obj.assignee = obj.assignee.login;
        }
        if (obj.milestone && obj.milestone.number) {
            obj.milestone = obj.milestone.number;
        } else if (!obj.milestone) {
            obj.milestone = null;
        }
        if (obj.labels) {
            var labels = [];
            for (var i in obj.labels) {
                labels.push(obj.labels[i].name || obj.labels[i]);
            }
            obj.labels = labels;
        }
        return obj;
    },
    addLabel: function (id) {
        if (!this.hasLabel(id)) {
            var label = ScrHub.model.labels.get(id);
            if (!label) {
                throw "label not found on github, maybe need to create it"
            }
            return this.get("labels").push(label);
        }
    },
    removeLabel: function (label) {
        var labels = this.get("labels");
        for (i in labels) {
            if (labels[i] == label || labels[i].name == label) {
                labels.splice(i, 1);
                return labels;
            }
        }
        return labels;
    },
    hasLabel: function (label) {
        var labels = this.get("labels");
        for (i in labels) {
            if (labels[i] == label || labels[i].name == label) {
                return true;
            }
        }
        return false;
    }
});

ScrHub.model.StoryList = Backbone.Collection.extend({
    model: ScrHub.model.Story,
    url: "/api/" + params.project + "/stories/"
});



ScrHub.model.Label = Backbone.Model.extend({
    idAttribute: "name",
    url: function () {
        return "/api/" + params.project + "/label/" + (this.id || "new")
    }
});

ScrHub.model.LabelList = Backbone.Collection.extend({
    model: ScrHub.model.Label,
    url: function () {
        return "/api/" + params.project + "/labels/"
    }
});
ScrHub.model.labels = new ScrHub.model.LabelList();
ScrHub.model.labels.fetch();



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

