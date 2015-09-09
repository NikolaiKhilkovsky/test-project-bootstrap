'use strict';

/* App Module */

var app = angular.module('app', [
    'ngRoute',
    'httpAPIMock',
    'appFilters',
    'appDirectives',
    'appServices',
    'appControllers'
]);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/partials/directory.html',
            controller: 'DirectoryCtrl'
        })
        .when('/directory/:fName*', {
            templateUrl: '/partials/directory.html',
            controller: 'DirectoryCtrl'
        })
        .when('/file/:fName*', {
            templateUrl: '/partials/file.html',
            controller: 'FileCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
    $locationProvider.html5Mode(true);
}]);
app.run(['$httpBackend', function ($httpBackend) {
    $httpBackend.whenGET(/^\/partials\//).passThrough();
}]);
