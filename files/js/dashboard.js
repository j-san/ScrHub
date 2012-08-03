$(function () {
    $.getJSON('/api/' + params.project + '/sprints/', function (sprints) {
        var current;
        for (var i in sprints) {
            if (sprints[i].current) {
                current = sprints[i];
            }
        }
        $.getJSON('/api/' + params.project + '/sprint/' + current.number + '/stories/', function (stories) {
            var todo = $("#todo"), progress = $("#progress"), story, ticket;
            for (var i in stories) {
                story = stories[i];
                ticket = $("<div class='story-ticket'><h3>" + story.number + ". " + story.title + "</h3></div>");
                if (!story.assignee) {
                    todo.append(ticket);
                } else { // if not testing label
                    progress.append(ticket);
                    ticket.prepend("<img src='" + story.assignee.avatar_url + "' />");
                }
            }
        });
    });
});
