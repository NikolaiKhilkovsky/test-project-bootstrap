'use strict';

/* Controllers */

var appControllers = angular.module('appControllers', []);

appControllers.controller('MainCtrl', ['$scope', function ($scope) {
        $scope.authorName = 'Nikko';
        $scope.breadcrumb = [];
    }]);

appControllers.controller('DirectoryCtrl', ['$scope', '$routeParams', 'list', 'sort', 'rename', 'dialog', 'breadcrumb', function ($scope, $routeParams, list, sort, rename, dialog,
        breadcrumb) {
        $scope.reverse_name = false;
        $scope.reverse_date = false;
        $scope.predicate = sort('name', $scope.reverse_name);
        $scope.sort = sort;
        list($routeParams.fName).then(function (response) {
            $scope.files = response;
            $scope.$parent.breadcrumb = [];
            if ($routeParams.fName) {
                breadcrumb($scope.$parent, $routeParams.fName.split('/'));
            }
        });
        $scope.rename = function (scope) {
            var new_name = dialog.prompt('Please, enter new name', scope.f.name);
            if (new_name) {
                rename(scope, new_name).then(function (response) {
                    if (!response) {
                        renameFile(scope);
                    }
                });
            }
        };
    }]);

appControllers.controller('FileCtrl', ['$scope', '$routeParams', '$location', 'list', 'rename', 'dialog', 'breadcrumb', function ($scope, $routeParams, $location, list, rename,
        dialog, breadcrumb) {
        list($routeParams.fName).then(function (response) {
            $scope.files = response;
            $scope.$parent.breadcrumb = [];
            breadcrumb($scope.$parent, $scope.files[0].path);
            $scope.$parent.breadcrumb.push({
                url: '/file' + $scope.files[0].fullname,
                name: $scope.files[0].name
            });
        });
        $scope.rename = function (scope) {
            var new_name = dialog.prompt('Please, enter new name', scope.f.name);
            if (new_name) {
                rename(scope, new_name).then(function (response) {
                    if (response) {
                        if (!scope.f.directory) {
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
    }]);
