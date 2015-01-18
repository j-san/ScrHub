
define(['backbone'], function (Backbone) {

    var fiboSuite = [];
    (function fiboSuiteFunc(prev, fibo) {
        fiboSuite.push(fibo);
        if (fiboSuite.length <= 6) {
            fiboSuiteFunc(fibo, prev + fibo);
        }
    }(1, 1));

    return Backbone.View.extend({
        tagName: "li",
        className: "backlog-line",
        events: {
            //"blur .story-title": "saveStoryTitle",
            //"blur .story-body": "saveStoryBody",
            //"clickoutside .edit-form": "hideEdit",
            "click .select-sprint li": "saveStorySprint"
        },

        template: _.template([
                '<span class="story-id"><%= model.id || "new" %>.</span>',
                '<span class="story-title"><input type="text" value="<%= model.get("title") %>" /></span>',
                '<span class="story-info">',
                    '<%= model.get("businessValue") || "-" %>',
                    ' / <%= (model.get("priority") && model.get("priority").toFixed(2)) || "-" %>',
                    ' = <%= model.get("difficulty") || "-" %>',
                '</span>',
                '<input class="input-business-value" type="number" value="<%= model.get("businessValue") %>"/>',
                '<div class="input-difficulty" data-toggle="buttons-radio"><% _.each(fiboSuite, function(fibo, i) { %>',
                    '<input id="<%= model.id || "new" %>-difficulty-<%= fibo %>" name="<%= model.id || "new" %>-difficulty" type="radio" value="<%= fibo %>" <%= model.get("difficulty")===fibo?"checked":"" %> />',
                    '<label for="<%= model.id || "new" %>-difficulty-<%= fibo %>" class="btn btn-default <%= model.get("difficulty")===fibo?"active":"" %>"><%= fibo %></label>',
                '<% }); %></div>',
                '<span class="story-body"><textarea><%= model.get("body") %></textarea></span>',
                // '<span class="story-sprint"><%= model.get("body") %></span>'
            ].join('\n')),

        render: function() {
            var self = this;

            this.$el.html(this.template({ model: this.model, fiboSuite: fiboSuite }));
            this.id = this.el.id = "story-" + this.model.id;

            this.model.on("change:number", function (model, newValue) {
                self.$el.find(".story-id").text(newValue + ".");
            });

            this.sprint = this.$(".story-sprint");

            this.setSprint();
            this.model.on("change:milestone", function () {
                self.setSprint();
            });

            return this.$el;
        },
        setSprint: function () {
            this.$el.find('.select-sprint li').removeClass("active");
            if (this.model.has("milestone") && typeof this.model.get("milestone") == "object") {
                this.sprint.html(this.model.get("milestone").title).addClass('active');
                this.$el.find('#sprint-' + this.model.get("milestone").number).addClass("active");
            } else if(!this.model.has("milestone")) {
                this.sprint.html("none").removeClass('active');
                this.$el.find('#no-sprint').addClass("active");
            }

        },
        saveStorySprint: function (evt) {
            var newValue = $(evt.currentTarget).data("number");
            if((!this.model.has("milestone") && newValue) || (this.model.has("milestone") && this.model.get("milestone") != newValue)) {
                this.model.set("milestone", newValue);
                this.syncModel();
            }
        },
        save: function () {
            var title = this.$el.find(".story-title").find("input").val(),
                body = this.$el.find(".story-body").find("textarea").val(),
                businessValue = this.$el.find(".input-business-value").val(),
                difficulty = this.$el.find(".input-difficulty :checked").val();

            if (title === this.model.get("title") &&
                    body === this.model.get("body") &&
                    businessValue == this.model.get("businessValue") &&
                    difficulty == this.model.get("difficulty")) {
                return;
            }

            this.model.set("title", title);
            this.model.set("body", body);
            //this.model.set("milestone", $(evt.currentTarget).data("number"));
            this.model.set("businessValue", Number(businessValue));
            this.model.set("difficulty", Number(difficulty));
            this.syncModel();
        },
        syncModel: function () {
            var self = this;
            this.$el.addClass("loading");
            this.$el.removeClass("error");
            this.model.save({}, {
                success: function () {
                    self.$el.removeClass("loading");
                    self.$el.removeClass("error");
                },
                error: function () {
                    self.$el.removeClass("loading");
                    self.$el.addClass("error");
                    alert('error while saving, check if you are connected');
                }
            });
        },
        showEdit: function () {
            this.$el.addClass("edit-form");
        },
        hideEdit: function () {
            this.$el.removeClass("edit-form");
            this.save();
        }
    });
});