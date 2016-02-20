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

      if (!this.isAdmin) {
        $http.get('/api/servers').then(response => {
          this.servers = response.data;
          this.servers.forEach((server) => this.injectButtons(server._id));
          console.log('not admin');
          console.log(this.servers)
        }); // end $http.get('/api/servers/model').then(response => {
      } else {
        $http.get('/api/servers/listall').then(response => {
          this.servers = response.data;
          this.servers.forEach((server) => this.injectButtons(server._id));
          console.log('admin');
          console.log(this.servers)
        }); // end $http.get('/api/servers/model').then(response => {
      }
      $scope.$on('$destroy', function () {
        socket.unsyncUpdates('server');
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
          onClick() {
            self.$http.put('/api/servers/start/' + srvrId);
            btnSelf.data.start.disabled = true;
            btnSelf.data.stop.disabled = true;

            _.delay(()=> {
              btnSelf.data.stop.disabled = false;
            }, 60000);
          },
          isDisabled() {
            return btnSelf.data.start.disabled;
          }
        },
        stop: {
          onClick() {
            self.$http.put('/api/servers/stop/' + srvrId);
            btnSelf.data.start.disabled = true;
            btnSelf.data.stop.disabled = true;

            _.delay(()=> {
              btnSelf.data.start.disabled = false;
            }, 60000);
          },
          isDisabled() {
            return btnSelf.data.stop.disabled;
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
            return  self.buttons.editingId === undefined;
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
            console.log("reset");
            let server = _.find(self.servers, {'_id': srvrId});
            //this.model = response.data;
            self.modelKeys.forEach((key)=>{
              server[key] = self.model[key].default;
            });
          },
          isDisabled() {
            return self.buttons.editingId === undefined;
          }
        }
      };
    } // end injectButtons
  }

  angular.module('ogarMindApp')
    .controller('ServermanagementCtrl', ServermanagementCtrl);

})();
