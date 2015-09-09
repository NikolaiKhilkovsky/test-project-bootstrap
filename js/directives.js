'use strict';

/* Directives */

angular.module('appDirectives', []).directive('preview', function factory(){
    var directiveDefinitionObject = {
        templateUrl: '/partials/preview.html',
        replace: true,
        transclude: true,
        scope: true,
        link: function(scope, element, attrs){
            var tmp, style = {},
                style_arr = attrs.style.split(';');
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
});
