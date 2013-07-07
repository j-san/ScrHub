

define(['backbone'], function (Backbone) {

    var Sprint = Backbone.Model.extend({
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

    Sprint.SprintList = Backbone.Collection.extend({
        model: Sprint,
        url: "/api/" + params.project + "/sprints/"
    });

    return Sprint;
});