"use strict";

exports.sum = function(array) {
    var count = 0;
    for (var i = 0; i < array.length; ++i) {
        count += array[i];
    }
    return count;
}

exports.shuffle = function(source) {
    var a = [];
    a[0] = source[0];

    for (var i = 1; i < source.length; ++i) {
        var j = Math.floor(Math.random()*(i+1));
        if (j !== i) {
            a[i] = a[j];
        }

        a[j] = source[i];
    }

    return a;
}
