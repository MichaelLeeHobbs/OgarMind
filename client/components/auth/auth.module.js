'use strict';

angular.module('ogarMindApp.auth', [
  'ogarMindApp.constants',
  'ogarMindApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
