
var Document = require('mongoose').Document;

exports.merge = function(dest, from) {
    var props = Object.getOwnPropertyNames(from);
    if (dest instanceof Document) {
        dest = dest.toObject();
    }
    props.forEach(function(name) {
        var prop = Object.getOwnPropertyDescriptor(from, name);
        Object.defineProperty(dest, name, prop);
    });
    return dest;
};
