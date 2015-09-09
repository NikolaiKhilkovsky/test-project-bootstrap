'use strict';

/* Filters */

var appFilters = angular.module('appFilters', [])

appFilters.filter('arrayToString', function () {
    return function (arr) {
        return '/' + arr.join('/');
    };
});

appFilters.filter('dateReadable', function () {
    return function (date) {
        date = new Date(date);
        var now = new Date();
        var default_format = date.getFullYear() + '-'
            + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) + '-'
            + (date.getDate() < 10 ? '0' : '') + date.getDate();
        switch(new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(date.getFullYear(), date.getMonth(), date.getDate())){
            case 0:
                date = 'Today';
                break;
            case 86400000:
                date = 'Yesterday';
                break;
            default:
                date = default_format;
        }
        return date;
    };
});
