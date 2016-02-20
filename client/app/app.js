'use strict';

angular.module('ogarMindApp', [
  'ogarMindApp.auth',
  'ogarMindApp.admin',
  'ogarMindApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'validation.match',
  'mgcrea.ngStrap'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
