
require(['backbone', 'jquery', 'js/UI/ProductBacklog', 'js/UI/Dashboard'], function(Backbone, $, ProductBacklog, Dashboard) {

    var container = $('#app-container');
    var App = Backbone.Router.extend({
        routes: {
            "backlog":   "backlog",
            "dashboard": "dashboard",
        },

        backlog: function() {
            $('.navigation').removeClass('active');
            $('#nav-backlog').addClass('active');
            var backlog = new ProductBacklog();
            container.html(backlog.render());
        },

        dashboard: function() {
            $('.navigation').removeClass('active');
            $('#nav-dashboard').addClass('active');
            var dashboard = new Dashboard();
            container.html(dashboard.render());
        }
    });

    $(function(){
        var app = new App();
        Backbone.history.start();

        if (!Backbone.history.fragment) {
            app.navigate('backlog', {trigger: true});
        }
    });
});