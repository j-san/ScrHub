$(function () {
    $.getJSON('/api/' + params.project + '/stories/', function (stories) {
        var line;
        for (var i in stories) {
            story = stories[i];
            line = $("<p class='story-line'>" + story.number + ". " + story.title + "</p>");
            $('body').append(line);
        }
    });
});
