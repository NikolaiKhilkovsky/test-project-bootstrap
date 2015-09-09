"use strict";

angular.module('app', ['ngRoute', 'httpAPIMock'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
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
    }])
    .run(['$httpBackend', function ($httpBackend){
        $httpBackend.whenGET(/^\/partials\//).passThrough();
    }])
    .filter('arrayToString', function(){
        return function(arr){
            return '/' + arr.join('/');
        };
    })
    .service('dialog', function(){
        return {
            alert: function(msg){
                alert(msg);
            },
            prompt: function(msg, value){
                return prompt(msg, value);
            },
            confirm: function(msg){
                return confirm(msg);
            }
        };
    })
    .service('normalizeName', function(){
        return function(scope){
            scope.fullname = scope.name;
            scope.path = scope.fullname.replace(/^\//, '').split('/');
            scope.name = scope.path[scope.path.length - 1];
            scope.path.splice(scope.path.length - 1, 1);
            scope.type = scope.directory ? '' : /\.(.+)$/.exec(scope.name)[1];
        };
    })
    .service('list', function ($http, dialog, normalizeName) {
        return function (path) {
            path = path ? '?path=' + path : '';
            return $http.get('/api/files' + path).then(function (response) {
                for(var i = 0; i < response.data.length; i++){
                    normalizeName(response.data[i]);
                }
                return response.data;
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
    .service('rename', function ($http, dialog, normalizeName) {
        return function(scope, new_name){
            new_name = scope.f.path.join('/') + '/' + new_name;
            return $http.post('/api/files/rename', {from:scope.f.fullname, to: new_name}).then(function(response){
                scope.f.name = response.data.name;
                normalizeName(scope.f);
                return true;
            }).catch(function(response){
                console.error(response.config.method, response.config.url, response.config.data, response.status, '\nResponse:', response.data);
                dialog.alert(response.data.message);
                return false;
            });
        };
    })
    .service('breadcrumb', function(){
        return function(scope, path){
            for(var i = 0; i < path.length; i++){
                if(i == 0){
                    scope.breadcrumb.push({
                        url: '/directory/' + path[i],
                        name: path[i]
                    });
                }
                else {
                    scope.breadcrumb.push({
                        url: scope.breadcrumb[i - 1].url + '/' + path[i],
                        name: path[i]
                    });
                }
            }
        };
    })
    .directive('preview', function factory(){
        var directiveDefinitionObject = {
            templateUrl: '/partials/preview.html',
            replace: true,
            transclude: true,
            scope: true,
            link: function(scope, element, attrs){
                var style = {},
                    style_arr = attrs.style.split(';'),
                    tmp;
                for(var i = 0; i < style_arr.length; i++){
                    tmp = style_arr[i].split(':');
                    style[tmp[0].replace(/^\s+/, '').replace(/\s+$/, '')] = parseInt(tmp[1].replace(/^\s+/, '').replace(/\s+$/, ''), 10);
                }
                scope.style = style;
                if(scope.$parent.f.type == 'txt'){
                    element.find('img').remove();
                }
                else{
                    element.find('article').remove();
                }
            }
        };
        return directiveDefinitionObject;
    })
    .controller('MainCtrl', function ($scope) {
        $scope.authorName = 'Nikko';
        $scope.breadcrumb = [];
    })
    .controller('DirectoryCtrl', function($scope, $routeParams, list, sort, rename, dialog, breadcrumb){
        $scope.reverse_name = false;
        $scope.reverse_date = false;
        $scope.predicate = sort('name', $scope.reverse_name);
        $scope.sort = sort;
        list($routeParams.fName).then(function(response){
            $scope.files = response;
            $scope.$parent.breadcrumb = [];
            if($routeParams.fName){
                breadcrumb($scope.$parent, $routeParams.fName.split('/'));
            }
        });
        $scope.rename = function(scope){
            var new_name = dialog.prompt('Please, enter new name', scope.f.name);
            if(new_name){
                rename(scope, new_name).then(function(response){
                    if(!response){
                        renameFile(scope);
                    }
                });
            }
        };
    })
    .controller('FileCtrl', function($scope, $routeParams, $location, list, rename, dialog, breadcrumb){
        list($routeParams.fName).then(function(response){
            $scope.files = response;
            $scope.$parent.breadcrumb = [];
            breadcrumb($scope.$parent, $scope.files[0].path);
            $scope.$parent.breadcrumb.push({
                url: '/file' + $scope.files[0].fullname,
                name: $scope.files[0].name
            });
        });
        $scope.rename = function(scope){
            var new_name = dialog.prompt('Please, enter new name', scope.f.name);
            if(new_name){
                rename(scope, new_name).then(function(response){
                    if(response){
                        if(!scope.f.directory){
                            $location.url('/file' + scope.f.fullname);
                            $location.replace();
                            $scope.$parent.breadcrumb[$scope.$parent.breadcrumb.length - 1] = {
                                url: '/file' + scope.f.fullname,
                                name: scope.f.name
                            };
                        }
                    }
                    else {
                        renameFile(scope);
                    }
                });
            }
        };
    });
