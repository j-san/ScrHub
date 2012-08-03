$(function () {

    $.getJSON('/api/' + params.project + '/sprints/', function (sprints) {
        var sprint, option, sprintSelect = $("<select/>").appendTo("#backlog-options");
        sprintSelect.append("<option>Select a sprint</option>");
        for (var i in sprints) {
            sprint = sprints[i];
            option = $("<option />");
            option.text(sprint.title);
            option.val(sprint.number);
            //~ if (sprint.current) {
                //~ option.prop('selected', true);
            //~ }
            sprintSelect.append(option);
        }
        sprintSelect.change(function() {
            $(".sprint-" + sprintSelect.val()).addClass("highlight");
        });
    });

    $.getJSON('/api/' + params.project + '/stories/', function (stories) {
        var line, content = $('#backlog-content');
        for (var i in stories) {
            story = stories[i];
            line = $("<p class='story-line'>" + story.number + ". " + story.title + "</p>");
            if (story.milestone) {
                line.addClass("sprint-" + story.milestone.number);
            }
            content.append(line);
        }
        $("<p class='story-line'>add:<input /></p>").appendTo(content);
    });
});
