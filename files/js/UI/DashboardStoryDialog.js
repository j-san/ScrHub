define(['backbone'], function (Backbone) {

    return Backbone.View.extend({
        className: 'detail modal hide',
        events: {
            "click .close": "closeDialog",
            "click #take-in-charge": "takeInChargeStory",
            "click #give-up": "giveUpStory",
            "click #test": "readyForTestStory",
            "click #resume": "resumeStory",
            "click #close": "closeStory"
        },
        template: _.template([
                '<div class="modal-header">',
                    '<button class="close">x</button>',
                    '<h3><%= model.get("title") %></h3>',
                '</div>',
                '<div class="modal-body">',
                    '<button id="take-in-charge">Take in charge</button>',
                    '<button id="give-up">Give up</button>',
                    '<button id="test">Processed</button>',
                    '<button id="resume">Resume</button>',
                    '<button id="close">Close</button>',
                    '<div class="story-body"><%= model.get("body") || "no description" %></div>',
                '</div>',
            ].join('\n')),
        render: function () {
            this.sender = this.options.sender;
            this.$el.html(this.template({ model: this.model }));
            this.$el.appendTo(this.sender.$el.closest(".column"));
            this.$el.modal();
        },
        closeDialog: function () {
            this.$el.modal("hide");
            this.$el.remove();
        },
        takeInChargeStory: function () {
            this.sender.save({"assignee": params.me});
        },
        giveUpStory: function () {
            this.sender.save({"assignee": null});
        },
        readyForTestStory: function () {
            this.model.addLabel("testing");
            this.sender.save();
        },
        resumeStory: function () {
            this.model.removeLabel("testing");
            this.sender.save();
        },
        closeStory: function () {
            this.sender.save({"state": "closed"});
        }
    });
});

