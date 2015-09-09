'use strict';

/* Filters */

angular.module('appFilters', []).filter('arrayToString', function () {
    return function (arr) {
        return '/' + arr.join('/');
    };
});
