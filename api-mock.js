"use strict";
(function(window, angular, undefined) {
    var files = [
        {name: '/', date: 1440018120000, size: 0, directory: true},
        {name: '/secrets & documents/cash.txt', date: 1440017128876, size: 25e3},
        {name: '/secrets & documents/trip.txt', date: 1440017128876, size: 25e3},
        {name: '/secrets & documents', date: 1439098268876, size: 0, directory: true},
        {name: '/image-0.jpg', date: 1439908288876, size: 255e3},
        {name: '/image-10.jpg', date: 1439918198876, size: 1155e3},
        {name: '/image-2.jpg', date: 1440098198876, size: 3155e3},
        {name: '/my-vacation', date: 1439098268876, size: 0, directory: true},
        {name: '/my-vacation/photo-000.jpg', date: 1439098268876, size: 22205e3},
        {name: '/my-vacation/photo-001.jpg', date: 1440058258876, size: 6180e3},
        {name: '/my-vacation/photo-002.jpg', date: 1440018178876, size: 1073741824}
    ];

    angular.module('httpAPIMock', ['ngMockE2E'])
        .run(function ($httpBackend) {
            function normalize(_path) {
                return '/' + _path.trim().split(/\/+/).filter(angular.identity).join('/');
            }

            function dirname(_path) {
                return normalize(_path).split('/').slice(0, -1).join('/') || '/';
            }

            function find(_path) {
                _path = normalize(_path);
                return files.reduce(function (_found, _file) {
                    return _found || (_path === _file.name ? _file : null);
                }, null);
            }

            function list(_path) {
                _path = normalize(_path);

                return files.filter(function (_file) {
                    return '/' !== _file.name && _path === dirname(_file.name);
                })
            }

            function e(code, message) {
                return function (_path) {
                    return {
                        code: code.toUpperCase(),
                        message: message.replace(':path', _path)
                    }
                }
            }

            var enoent = e('ENOENT', 'No such file or directory \':path\'');
            var enotdir = e('ENOTDIR', 'Not a directory \':path\'');
            var eexist = e('EEXIST', 'File already exists \':path\'');

            $httpBackend.whenGET('/api/files').respond(function () {
                return [200, list('/')];
            });
            $httpBackend.whenGET(/^\/api\/files\?path=/).respond(function (method, uri) {
                var requestedFilePath = normalize(uri.slice(16));
                var requestedFile = find(requestedFilePath);

                if (!requestedFile) {
                    return [404, enoent(requestedFilePath)]
                }

                if (!requestedFile.directory) {
                    return [200, [requestedFile]]
                }

                return [200, list(requestedFilePath)];
            });

            $httpBackend.whenPOST('/api/files/rename').respond(function (method, uri, data) {
                data = JSON.parse(data);

                data.from = normalize(data.from);
                data.to = normalize(data.to);

                var file = find(data.from);
                var target = find(data.to);

                if (!file) {
                    return [404, enoent(data.from)];
                }

                if (target) {
                    return [400, eexist(data.to)];
                }

                file.name = data.to;
                if (file.directory) {
                    list(data.from).forEach(function (_file) {
                        _file.name = data.to + _file.name.slice(data.from.length);
                    })
                }

                return [200, file];
            });
        });

})(window, angular);