
var Document = require('mongoose').Document;

exports.merge = function(dest, from) {
    var props = Object.getOwnPropertyNames(from);
    props.forEach(function(name) {
        if (dest instanceof Document) {
            dest.set(name,from[name]);
        } else {
            var destination = Object.getOwnPropertyDescriptor(from, name);
            Object.defineProperty(dest, name, destination);
        }
    });
    return dest;
};
