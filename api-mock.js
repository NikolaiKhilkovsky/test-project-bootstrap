"use strict";

var files = [
    {name: '/secrets & documents/cash.txt', date: 1440017128876, size: 25e3},
    {name: '/secrets & documents/trip.txt', date: 1440017128876, size: 25e3},
    {name: '/secrets & documents', date: 1439098268876, size: 0},
    {name: '/image-0.jpg', date: 1439908288876, size: 255e3},
    {name: '/image-10.jpg', date: 1439918198876, size: 1155e3},
    {name: '/image-2.jpg', date: 1440098198876, size: 3155e3},
    {name: '/my-vacation', date: 1439098268876, size: 0},
    {name: '/my-vacation/photo-000.jpg', date: 1439098268876, size: 22205e3},
    {name: '/my-vacation/photo-001.jpg', date: 1440058258876, size: 6180e3},
    {name: '/my-vacation/photo-002.jpg', date: 1440018178876, size: 1073741824}
];

angular.module('httpAPIMock', ['ngMockE2E'])
    .service('path', function(){
        return {
            normalize: function(_path) {
                return '/' + _path.trim().split(/\/+/).filter(angular.identity).join('/');
            },
            dirname: function(_path) {
                return this.normalize(_path).split('/').slice(0, -1).join('/') || '/';
            }
        };
    })
    .run(function ($httpBackend, path) {
        function find(_path) {
            _path = path.normalize(_path);
            return files.reduce(function (_found, _file) {
                return _found || (_path === _file.name ? _file : null);
            }, null);
        }

        function list(_path) {
            _path = path.normalize(_path);

            return angular.copy(files).filter(function(_file){
                return _path == path.dirname(_file.name);
            })
        }

        function e(code, message) {
            return function(_path){
                return {
                    code: code.toUpperCase(),
                    message: message.replace(':path', _path)
                }
            }
        }

        var enoent = e('ENOENT', 'No such file or directory \':path\'');
        var enotdir = e('ENOTDIR', 'Not a directory \':path\'');
        var eexist = e('EEXIST', 'File already exists \':path\'');

        $httpBackend.whenGET('/api/files').respond(function(){
            return [200, list('/')];
        });
        $httpBackend.whenGET(/^\/api\/files\?dir=/).respond(function(method, uri){
            var requestedFilePath = path.normalize(uri.slice(15));

            if('/' === requestedFilePath) {
                return [200, list('/')];
            } else {
                if(!find(requestedFilePath)) {
                    return [404, enoent(requestedFilePath)]
                }

                if(requestedFilePath.match(/\.(jpg|txt)$/)) {
                    return [400, enotdir(requestedFilePath)]
                }

                return [200, list(requestedFilePath)];
            }
        });

        $httpBackend.whenPOST('/api/files/rename').respond(function (method, uri, data) {
            data = JSON.parse(data);

            var file = find(data.from);
            var target = find(data.to);

            if(!file) {
                return [404, enoent(data.from)];
            }

            if(target) {
                return [400, eexist(data.to)];
            }

            file.name = data.to;
            return [200, file];
        });
    });
