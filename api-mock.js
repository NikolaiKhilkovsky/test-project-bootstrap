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
    .run(function ($httpBackend) {
        function find(value) {
            return files.reduce(function (_found, _file) {
                return _found || (value === _file.name ? _file : null);
            }, null);
        }

        $httpBackend.whenGET('/api/files').respond(function(){
            return [200, angular.copy(files)];
        });

        $httpBackend.whenGET(/^\/api\/files\/exists\?file=/).respond(function (method, uri) {
            var requestedFilePath = uri.slice(23);
            var requestedFile = find(requestedFilePath);

            return [200, !!requestedFile];
        });

        $httpBackend.whenPOST('/api/files/rename').respond(function (method, uri, data) {
            data = JSON.parse(data);

            var file = find(data.from);
            var target = find(data.to);

            if(!file) {
                return [404, {
                    code: 'ENOENT',
                    message: 'No such file or directory \':path\''.replace(':path', data.from)
                }];
            }

            if(target) {
                return [400, {
                    code: 'EEXIST',
                    message: 'File already exists \':path\''.replace(':path', data.to)
                }];
            }

            file.name = data.to;
            return [200, file];
        });
    });
