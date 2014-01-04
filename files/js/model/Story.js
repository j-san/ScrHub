
define(['backbone', 'model/Label'], function (Backbone, Label) {

    var Story = Backbone.Model.extend({
        idAttribute: "number",
        defaults: {
            "id": "",
            "title": "",
            "body": "",
            "state": "open",
            "difficulty": 0,
            "businessValue": 0,
            "assignee": null,
            "milestone": null,
            "labels": []
        },
        url: function () {
            return "/api/" + params.project + "/story/" + (this.id || "new");
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
                var label = Label.getLabel(id);
                if (!label) {
                    throw Error("label not found on github, maybe need to create it");
                }
                return this.get("labels").push(label);
            }
        },
        removeLabel: function (label) {
            var labels = this.get("labels");
            for (var i in labels) {
                if (labels[i] === label || labels[i].name === label) {
                    labels.splice(i, 1);
                    return labels;
                }
            }
            return labels;
        },
        hasLabel: function (label) {
            var labels = this.get("labels");
            for (var i in labels) {
                if (labels[i] === label || labels[i].name === label) {
                    return true;
                }
            }
            return false;
        }
    }, { // class properties
        getStoryList: function() {
            var Collection = Backbone.Collection.extend({
                model: Story,
                url: "/api/" + params.project + "/stories/"
            });
            return new Collection();
        },
        getCurrentSprintStoryList: function() {
            var Collection = Backbone.Collection.extend({
                model: Story,
                url: "/api/" + params.project + "/sprint/current/stories/"
            });
            return new Collection();
        }
    });

    return Story;
});


