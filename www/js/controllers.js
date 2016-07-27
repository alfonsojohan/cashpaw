angular.module('starter.controllers', [])
.controller('DashCtrl', DashCtrl)
.controller('AuthCtrl', AuthCtrl)
.controller('InitCtrl', InitCtrl)
.controller('AppCtrl', AppCtrl);

/**
 * This controller is defined at the body of the app and will be called as default
 * We do the authentication and authorization checking here
 */
function AppCtrl($scope, AUTH_EVENTS) {
  
  console.log('AppCtrl');

  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });
 
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    
    AuthService.logout();
    
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });

    $state.go('login', {
      location: "replace"
    });
  });

};  // eo AppCtrl

function InitCtrl(
  $state,
  $rootScope,
  PouchDbService,
  AuthService, 
  AUTH_EVENTS) {

  console.log('InitCtrl');

  function monitorStateChangeStart(event, next, nextParams, fromState) {

    console.log('InitCtrl.monitorStateChangeStart');

    //TODO: Complete unauthorized check
    if ('data' in next && 'authorizedRoles' in next.data) {
    // var authorizedRoles = next.data.authorizedRoles;
    // if (!AuthService.isAuthorized(authorizedRoles)) {
    //   event.preventDefault();
    //   $state.go($state.current, {}, {reload: true});
    //   $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
    // }
    };

    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login') {
        console.info('User is not authenticated, sending to login page');
        event.preventDefault();
        $state.go('login');
      }
    }
  };

  /**
   * Intercept all state changes and check for authentication & authorization
   */
  $rootScope.$on('$stateChangeStart', monitorStateChangeStart);

  console.log('Pouch db:', PouchDbService.db());

  $state.go('tab.dash', {
    location: "replace"
  });
};

/**
 * Controller for authentication and authorization
 */
function AuthCtrl(
  $ionicLoading, 
  $state,
  AuthService) {

  console.log('AuthCtrl');

  this.data = {u: null, p: null};

  this.login = function (data) {
    
    console.log('AuthCtrl.login', data);

    $ionicLoading.show();
    AuthService.login(data.u, data.p)
    .then(function (firebaseUser) {
      console.log("Signed in as:", firebaseUser.uid);
      $state.go('tab.dash');
    })
    .catch(function (error) {
      console.log("Authentication failed:", error);
    })
    .finally(function() {
      $ionicLoading.hide();
    });
  
  };  // eo AuthCtrl.login

  this.fbLogin = function () {
    AuthService.facebookLogin();
  };  // eo AuthCtrl.fbLogin

  this.googleLogin = function () {
    AuthService.googleLogin();
  };
};

/**
 * Main tab controller
 */
function DashCtrl($scope, AUTH_EVENTS) {
  console.log('DashCtrl');
};  // eo DashCtrl