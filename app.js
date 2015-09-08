"use strict";

angular.module('app', ['ngRoute', 'httpAPIMock'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
        $routeProvider
            .when('/', {
                templateUrl: '/directory.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode(true);
    }])
    .service('dialog', function(){
        return {
            alert: function(msg){
                alert(msg);
            },
            prompt: function(msg){
                return prompt(msg);
            },
            confirm: function(msg){
                return confirm(msg);
            }
        };
    })
    .service('list', function ($http, dialog) {
        return function (path) {
            path = path ? '?path=' + path : '';
            return $http.get('/api/files' + path).then(function (response) {
                return response;
            }).catch(function (response) {
                console.error(response.config.method, response.config.url, response.config.data, response.status, '\nResponse:', response.data);
                dialog.alert(response.data.message);
                return [];
            });
        };
    })
    .service('sort', function () {
        return function(field, reverse){
            return ['+directory', (reverse ? '-' : '+') + field];
        };
    })
    .service('rename', function ($http, dialog) {
        return function(scope, new_name){
            return $http.post('/api/files/rename', {from:scope.f.name, to: new_name}).then(function(response){
                scope.f = response.data;
                return true;
            }).catch(function(response){
                console.error(response.config.method, response.config.url, response.config.data, response.status, '\nResponse:', response.data);
                dialog.alert(response.data.message);
                return false;
            });
        };
    })
    .controller('MainCtrl', function ($scope, list, sort, rename, dialog) {
        console.dir($scope)
        $scope.authorName = 'Nikko';
        $scope.reverse_name = false;
        $scope.reverse_date = false;
        $scope.predicate = sort('name', $scope.reverse_name);
        $scope.sort = sort;
        $scope.rename = function(scope){
            var new_name = dialog.prompt('Please, enter new name');
            if(new_name){
                rename(scope, new_name).then(function(response){
                    if(!response){
                        renameFile(scope);
                    }
                });
            }
        };
        list().then(function(response){
            $scope.files = response.data;
        });;
    });
