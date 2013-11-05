/*********************************************
 *  Copyright (c) 2013 AnsibleWorks, Inc.
 *
 * Generic accessor for Ansible Commander services
 *
 */
angular.module('RestServices',['ngCookies','AuthService'])
.factory('Rest', ['$http','$rootScope','$cookieStore', '$q', 'Authorization',
function($http, $rootScope, $cookieStore, $q, Authorization) {
    return {

    setUrl: function (url) {
        this.url = url;
        },
    checkExpired: function() {
        return $rootScope.sessionTimer.isExpired();
        },
    pReplace: function() {
        //in our url, replace :xx params with a value, assuming
        //we can find it in user supplied params.
        var key,rgx;
        for (key in this.params) {
          rgx = new RegExp("\\:" + key,'gm'); 
          if (rgx.test(this.url)) {
             this.url = this.url.replace(rgx,this.params[key]);
             delete this.params[key];
          }
        }
        },
    createResponse: function(data, status) {
        // Simulate an http response when a token error occurs
        // http://stackoverflow.com/questions/18243286/angularjs-promises-simulate-http-promises
        
        var promise = $q.reject({ data: data, status: status });
        promise.success = function(fn){
            promise.then(function(response){ fn(response.data, response.status) }, null);
            return promise
            };
        promise.error = function(fn){
           promise.then(null, function(response){ fn(response.data, response.status) });
           return promise;
           };
        return promise;
        },
    get: function(args) {
        args = (args) ? args : {};
        this.params = (args.params) ? args.params : null;
        this.pReplace();
        var expired = this.checkExpired();
        var token = Authorization.getToken();
        if (expired) {
           return this.createResponse({ detail: 'Token is expired' }, 401);
        }
        else if (token) {
           return $http({method: 'GET', 
               url: this.url,
               headers: { 'Authorization': 'Token ' + token },
               params: this.params
               });
        }
        else {
            return this.createResponse({ detail: 'Invalid token' }, 401);
        }
        },
    post: function(data) {
        var token = Authorization.getToken();
        var expired = this.checkExpired();
        if (expired) {
            return this.createResponse({ detail: 'Token is expired' }, 401);
        }
        else if (token) {
            return $http({
                method: 'POST', 
                url: this.url,
                headers: { 'Authorization': 'Token ' + token }, 
                data: data });
        }
        else {
            return this.createResponse({ detail: 'Invalid token' }, 401);
        }
        },
    put: function(data) {
        var token = Authorization.getToken();
        var expired = this.checkExpired();
        if (expired) {
            return this.createResponse({ detail: 'Token is expired' }, 401);
        }
        else if (token) {
            return $http({
                method: 'PUT', 
                url: this.url,
                headers: { 'Authorization': 'Token ' + token }, 
                data: data });
        }
        else {
            return this.createResponse({ detail: 'Invalid token' }, 401);
        }
        },
    destroy: function(data) {
        var token = Authorization.getToken();
        var expired = this.checkExpired();
        if (expired) {
            return this.createResponse({ detail: 'Token is expired' }, 401);
        }
        else if (token) {
            return $http({
                method: 'DELETE',
                url: this.url,
                headers: { 'Authorization': 'Token ' + token },
                data: data });
         }
        else {
            return this.createResponse({ detail: 'Invalid token' }, 401);
        }
        },
    options: function() {
        var token = Authorization.getToken();
        var expired = this.checkExpired();
        if (expired) {
            return this.createResponse({ detail: 'Token is expired' }, 401);
        }
        else if (token) {
            return $http({
                method: 'OPTIONS',
                url: this.url,
                headers: { 'Authorization': 'Token ' + token }
                });
        }
        else {
            return this.createResponse({ detail: 'Invalid token' }, 401);
        }
        }
    }
}]);

