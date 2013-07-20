requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '/js',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        'backbone': 'http://backbonejs.org/backbone',
        'underscore': 'http://underscorejs.org/underscore'
        // 'backbone': '/components/backbone/backbone',
        // 'underscore': '/components/underscore/underscore'
    },
    shim: {
        'backbone': {
            deps: ['underscore'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        }
    }
});


require(['backbone', 'UI/ProductBacklog', 'UI/Dashboard'], function(Backbone, ProductBacklog, Dashboard) {

    var container = $('#app-container');
    var App = Backbone.Router.extend({
        routes: {
            "backlog":   "backlog",
            "dashboard": "dashboard",
        },

        backlog: function() {
            $('.navigation').removeClass('active');
            $('#nav-backlog').addClass('active');
            var backlog = new ProductBacklog()
            container.html(backlog.render());
        },

        dashboard: function(query, page) {
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