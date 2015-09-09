'use strict';

/* Services */

var appServices = angular.module('appServices', []);

appServices.service('dialog', function () {
    return {
        alert: function (msg) {
            alert(msg);
        },
        prompt: function (msg, value) {
            return prompt(msg, value);
        },
        confirm: function (msg) {
            return confirm(msg);
        }
    };
});

appServices.service('normalizeName', function () {
    return function (scope) {
        scope.fullname = scope.name;
        scope.path = scope.fullname.replace(/^\//, '').split('/');
        scope.name = scope.path[scope.path.length - 1];
        scope.path.splice(scope.path.length - 1, 1);
        scope.type = scope.directory ? '' : /\.(.+)$/.exec(scope.name)[1];
    };
});

appServices.service('list', ['$http', 'dialog', 'normalizeName', function ($http, dialog, normalizeName) {
    return function (path) {
        path = path ? '?path=' + path : '';
        return $http.get('/api/files' + path).then(function (response) {
            for (var i = 0; i < response.data.length; i++) {
                normalizeName(response.data[i]);
            }
            return response.data;
        }).catch(function (response) {
            console.error(response.config.method, response.config.url, response.config.data, response.status, '\nResponse:', response.data);
            dialog.alert(response.data.message);
            return [];
        });
    };
}]);

appServices.service('sort', function () {
    return function (field, reverse) {
        return ['+directory', (reverse ? '-' : '+') + field];
    };
});

appServices.service('rename', ['$http', 'dialog', 'normalizeName', function ($http, dialog, normalizeName) {
    return function (scope, new_name) {
        new_name = scope.f.path.join('/') + '/' + new_name;
        return $http.post('/api/files/rename', {
            from: scope.f.fullname,
            to: new_name
        }).then(function (response) {
            scope.f.name = response.data.name;
            normalizeName(scope.f);
            return true;
        }).catch(function (response) {
            console.error(response.config.method, response.config.url, response.config.data, response.status, '\nResponse:', response.data);
            dialog.alert(response.data.message);
            return false;
        });
    };
}]);

appServices.service('breadcrumb', function () {
    return function (scope, path) {
        for (var i = 0; i < path.length; i++) {
            if (i == 0) {
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
});
