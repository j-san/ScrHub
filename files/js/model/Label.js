
if (typeof window.ScrHub === "undefined") window.ScrHub = {};
if (typeof ScrHub.model === "undefined") ScrHub.model = {};


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


