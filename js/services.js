'use strict';

/* Services */

var appServices = angular.module('appServices', []);

appServices.service('dialog', function ($q) {
    return {
        alert: function(msg){
            var deferred = $q.defer();
            var acyncAlert = function(msg){
                alert(msg);
                return true;
            };
            deferred.resolve(acyncAlert(msg));
            return deferred.promise;
        },
        prompt: function(msg, value){
            var deferred = $q.defer();
            var acyncPrompt = function(msg, value){
                return prompt(msg, value);
            };
            deferred.resolve(acyncPrompt(msg, value));
            return deferred.promise;
        },
        confirm: function (msg){
            var deferred = $q.defer();
            var acyncConfirm = function(msg){
                return confirm(msg);
            };
            deferred.resolve(acyncConfirm(msg));
            return deferred.promise;
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

appServices.service('sort', ['$location', function ($location) {
    return function (type, reverse, scope) {
        function dataConvert(data){
            var ans = 0;
            data = data.toString();
            for (var i = 0; i < data.length; i++){
                ans += Math.sqrt(Number(data[i]));
            }
            return ans;
        }
        switch(type){
            case 'name':
                scope.files.sort(function(a, b){
                    if(a.directory === b.directory){
                        if(!a.directory){
                            if(a.type > b.type){
                                return (reverse ? 1 : -1);
                            }
                            else if(a.type < b.type){
                                return (reverse ? -1 : 1);
                            }
                            else {
                                return (reverse ? 1 : -1) * (a.name < b.name ? -1 : 1);
                            }
                        }
                        return (reverse ? 1 : -1) * (a.name < b.name ? -1 : 1);
                    }
                    else{
                        return a.directory ? -1 : 1;
                    }
                });
                break;
            case 'date':
                scope.files.sort(function(a, b){
                    if(a.directory === b.directory){
                        return (reverse ? 1 : -1) * (dataConvert(a.date) - dataConvert(b.date));
                    }
                    else{
                        return a.directory ? -1 : 1;
                    }
                });
                break;
        }
    };
}]);

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
