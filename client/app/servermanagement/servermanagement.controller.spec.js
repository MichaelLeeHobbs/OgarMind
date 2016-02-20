'use strict';

describe('Controller: ServermanagementCtrl', function () {

  // load the controller's module
  beforeEach(module('ogarMindApp'));

  var ServermanagementCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ServermanagementCtrl = $controller('ServermanagementCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    1.should.equal(1);
  });
});
