

define(['backbone'], function (Backbone) {

    var Label = Backbone.Model.extend({
        idAttribute: "name",
        url: function () {
            return "/api/" + params.project + "/label/" + (this.id || "new");
        }
    }, { //class properties
        getLabelList: function () {
            var Collection = Backbone.Collection.extend({
                model: Label,
                url: "/api/" + params.project + "/labels/"
            });
            return new Collection();
        },
        getLabel: function (id) {
            return this.labels.get(id);
        }
    });

    Label.labels = Label.getLabelList();
    Label.labels.fetch();
    return Label;
});
