"use strict";

angular.module('app', ['httpAPIMock'])
    .controller('ApiTestController', function ($scope, $http) {
        $http.get('/api/files')
            .then(function (response) {
                console.log('List', response.data);
                $scope.files = response.data;
            });

        $http.get('/api/files?dir=/my-vacation')
            .then(function (response) {
                console.log('List', response.data);
            })
            .catch(function (response) {
                console.error('list', response);
            });

        $http.post('/api/files/rename', {from: '/image-2.jpg', to: '/image-3.jpg'})
            .then(function (response) {
                console.log('Rename', response.data);
            });

        //Source file doesn't exist error
        $http.post('/api/files/rename', {from: '/image-does-not-exist.jpg', to: '/image-2.jpg'})
            .catch(function (response) {
                console.error('Rename', response);
            });

        //Target file already exists error
        $http.post('/api/files/rename', {from: '/image-0.jpg', to: '/image-10.jpg'})
            .catch(function (response) {
                console.error('Rename', response);
            });
    });
