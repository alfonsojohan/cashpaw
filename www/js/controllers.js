angular.module('starter.controllers', [])
.controller('DashCtrl', DashCtrl)
.controller('AuthCtrl', AuthCtrl)
.controller('AppCtrl', AppCtrl);

/**
 * This controller is defined at the body of the app and will be called as default
 * We do the authentication and authorization checking here
 */
function AppCtrl($scope, AUTH_EVENTS) {
  
  console.log('AppCtrl init');

  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });
 
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });

};  // eo AppCtrl

/**
 * Controller for authentication and authorization
 */
function AuthCtrl(
  $ionicLoading, 
  AuthService) {

  console.log('AuthCtrl init');

  this.data = {u: null, p: null};

  this.login = function (data) {
    
    console.log('AuthCtrl.login', data);

    $ionicLoading.show();
    AuthService.login(data.u, data.p)
    .then(function (firebaseUser) {
      console.log("Signed in as:", firebaseUser.uid);
    })
    .catch(function (error) {
      console.log("Authentication failed:", error);
    })
    .finally(function() {
      $ionicLoading.hide();
    });
  
  };  // eo AuthCtrl.login
};

/**
 * Main tab controller
 */
function DashCtrl($scope, AUTH_EVENTS) {
  console.log('DashCtrl init');
};  // eo DashCtrl