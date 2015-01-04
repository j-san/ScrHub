
define(['backbone', 'js/UI/DashboardStoryDialog'], function (Backbone, StoryDialog) {

    return Backbone.View.extend({
        className: "dashboard-ticket",
        events: {
            "click": "edit",
        },
        template: _.template([
            '<% if(this.model.get("assignee")) { %>',
                '<img class="avatar" src="<%= model.get("assignee").avatar_url %>" />',
            '<% } %>',
            '<h3><%= model.id %>. <%= model.get("title") %></h3>'
        ].join('\n')),
        render: function () {
            this.todo = $("#todo");
            this.progress = $("#progress");
            this.testing = $("#testing");
            var self = this;

            this.pinOnBoard();

            // this.model.on("change:assignee change:labels change:state", function () {
            //     self.pinOnBoard();
            // });
            return this.$el;
        },
        pinOnBoard: function () {
            this.$el.html(this.template({model: this.model}));

            if (this.model.get("assignee")) {
                if (this.model.hasLabel("testing")) {
                    this.testing.append(this.$el);
                } else if (this.model.get("state") === "closed") {
                    this.$el.remove();
                } else {
                    this.progress.append(this.$el);
                }
            } else {
                this.todo.append(this.$el);
            }
        },
        edit: function () {
            this.modal = new StoryDialog({ sender: this, model: this.model });
            this.modal.render();
        },
        save: function (data) {
            var self = this;
            this.$el.addClass("loading");
            this.model.save(data, {
                success: function () {
                    self.$el.removeClass("loading");
                    self.pinOnBoard();
                },
                error: function () {
                    self.$el.removeClass("loading");
                    self.$el.addClass("error");
                    alert('error while saving, check if you are connected');
                }
            });
            this.modal.closeDialog();
        }

    });
});
