"use strict";

angular.module('app', ['httpAPIMock'])
    .controller('ApiTestController', function ($scope, $http) {
        function logExample(title, promise) {
            return promise.then(function (response) {
                console.log(title, '\n', response.config.method, response.config.url, response.config.data, response.status, '\nResponse:', response.data);
                return response;
            }).catch(function(response){
                console.error(title, '\n', response.config.method, response.config.url, response.config.data, response.status, '\nResponse:', response.data);
            })
        }

        logExample('Rename',
            $http.post('/api/files/rename', {from: '/image-2.jpg', to: '/image-3.jpg'})
        );
        logExample('Rename directory',
            $http.post('/api/files/rename', {from: '/my-vacation', to: '/vacation'})
        );
        logExample('Rename: source file doesn\'t exist',
            $http.post('/api/files/rename', {from: '/image-does-not-exist.jpg', to: '/image-2.jpg'})
        );
        logExample('Rename: Target file already exists',
            $http.post('/api/files/rename', {from: '/image-0.jpg', to: '/image-10.jpg'})
        );

        logExample('List root directory', $http.get('/api/files'))
            .then(function (response) {
                $scope.files = response.data;
            });

        logExample('List directory',
            $http.get('/api/files?path=/vacation')
        );
        logExample('List single file',
            $http.get('/api/files?path=/image-0.jpg')
        );
    });
