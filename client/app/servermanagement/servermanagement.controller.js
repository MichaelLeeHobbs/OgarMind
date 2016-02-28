'use strict';

(function () {

  class ServermanagementCtrl {

    constructor($http, $scope, socket, Auth) {
      this.$http = $http;
      this.$scope = $scope;
      this.isLoggedIn = Auth.isLoggedIn();
      this.isAdmin = Auth.isAdmin();
      this.userPrivilegeLevel = (this.isAdmin) ? "admin" : "user";
      this.getCurrentUser = Auth.getCurrentUser();
      this.buttons = {
        editingId: undefined,
        servers: {}
      };

      $http.get('/api/servers/model').then(response => {
        this.model = response.data;
        this.modelKeys = Object.keys(this.model);
      }); // end $http.get('/api/servers/model').then(response => {

      this.getServers();
      $scope.$on('$destroy', function () {
        //socket.unsyncUpdates('server');
      });
    } // end constructor
    injectButtons(srvrId) {
      let self = this;

      function initData() {
        return {
          start: {disabled: false},
          stop: {disabled: false}
        }
      }

      let btnSelf = this.buttons[srvrId] = {
        data: initData(),
        start: {
          onClick: _.throttle(()=> {
            console.log("clicked start for: ", srvrId);
            self.$http.put('/api/servers/start/' + srvrId);
          }, 20000),
          isDisabled() {
            return false;
          }
        },
        stop: {
          onClick: _.throttle(()=> {
            self.$http.put('/api/servers/stop/' + srvrId);
          }, 20000),
          isDisabled() {
            return false;
          }
        },
        edit: {
          onClick() {
            console.log(btnSelf);
            // save unedited items so that we can restore them
            let server = _.find(self.servers, {'_id': srvrId});
            btnSelf.data.preEditData = _.clone(server);
            self.buttons.editingId = server._id;
          },
          isDisabled() {
            return self.buttons.editingId !== undefined
          }
        },
        cancel: {
          onClick() {
            // restore unedit server data
            let server = _.find(self.servers, {'_id': srvrId});

            _.merge(server, btnSelf.data.preEditData);
            delete btnSelf.data.preEditData;
            self.buttons.editingId = undefined;
          },
          isDisabled(){
            return self.buttons.editingId === undefined;
          }
        },
        save: {
          onClick() {
            let server = _.find(self.servers, {'_id': srvrId});
            self.$http.put('/api/servers/' + server._id, server);
            self.buttons.editingId = undefined;
          },
          isDisabled() {
            return self.buttons.editingId === undefined;
          }
        },
        reset: {
          onClick() {
            let server = _.find(self.servers, {'_id': srvrId});
            //this.model = response.data;
            self.modelKeys.forEach((key)=> {
              server[key] = self.model[key].default;
            });
          },
          isDisabled() {
            return self.buttons.editingId === undefined;
          }
        },
        delete: {
          onClick() {
            self.$http.delete('/api/servers/' + srvrId)
              .then(()=>self.servers = self.getServers());
          },
          isDisabled() {
            return !self.isAdmin;
          }
        }
      };
    } // end injectButtons
    createServer() {
      let newServer = {};
      this.modelKeys.forEach((key)=> {
        newServer[key] = this.model[key].default
      });
      this.$http.post('/api/servers', newServer)
        .then(()=>this.getServers());
    }

    getServers() {
      let uri = (this.isAdmin) ? 'api/servers/listall' : 'api/servers';
      this.$http.get(uri).then(response => {
        this.servers = response.data;
        this.servers.forEach((server) => this.injectButtons(server._id));
      }); // end $http.get('/api/servers/model').then(response => {
    }
  }

  angular.module('ogarMindApp')
    .controller('ServermanagementCtrl', ServermanagementCtrl);

})();
