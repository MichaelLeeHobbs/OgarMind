'use strict';

angular.module('ogarMindApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('servermanagement', {
        url: '/servermanagement',
        templateUrl: 'app/servermanagement/servermanagement.html',
        controller: 'ServermanagementCtrl',
        controllerAs: 'svrMng'
      });
  });
