'use strict';

(function() {

class MainController {

  constructor($http, $scope, socket) {
    this.$http = $http;
    this.servers = [];

    $http.get('/api/servers/status').then(response => {
      this.servers = response.data;
      socket.syncUpdates('servers/status', this.servers);
    });

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('servers/status');
    });
  }
}

angular.module('ogarMindApp')
  .controller('MainController', MainController);

})();
