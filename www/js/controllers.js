angular.module('starter.controllers', [])
.controller('DashCtrl', DashCtrl)
.controller('AuthCtrl', AuthCtrl)
.controller('InitCtrl', InitCtrl)
.controller('AppCtrl', AppCtrl);

/**
 * This controller is defined at the body of the app and will be called as default
 * We do the authentication and authorization checking here. 
 */
function AppCtrl(
  $scope,
  $state,
  $ionicPopup,
  AuthService, 
  AUTH_EVENTS) {
  
  console.log('AppCtrl');

  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });
 
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    
    AuthService.logout();
    
    // var alertPopup = $ionicPopup.alert({
    //   title: 'Session Lost!',
    //   template: 'Sorry, You have to login again.'
    // });

    $state.go('login', {
      location: "replace"
    });
  });

};  // eo AppCtrl

function InitCtrl(
  $state,
  $rootScope,
  $ionicHistory,
  PouchDbService,
  AuthService, 
  AUTH_EVENTS) {

  console.log('InitCtrl');

  function monitorStateChangeStart(event, next, nextParams, fromState) {

    console.log('InitCtrl.monitorStateChangeStart', next, fromState);

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
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      }
    }
  };

  /**
   * Init the authentication service, once completed move to the dashboard
   * The event monitor will handle the rest
   */
  PouchDbService.init()
  .then(function () {
    console.log('PouchDb init complete');
    return AuthService.init();  
  })
  .then(function (data) {
    
    console.log('AuthService.init complete.');
    
    /**
     * Intercept all state changes and check for authentication & authorization
     */
    $rootScope.$on('$stateChangeStart', monitorStateChangeStart);

    console.log('Going to dash...');

    $ionicHistory.clearHistory();
    $ionicHistory.nextViewOptions({
      disableBack: true,
      disableAnimate: true,
      historyRoot: true
    });

    $state.go('tab.dash', {
      location: "replace"
    });

    return true;
  })
  .catch(function (error) {
    console.error('Auth.init failed.', error);
  });
  
};

/**
 * Controller for authentication and authorization
 */
function AuthCtrl(
  $ionicLoading, 
  $ionicPopup,
  $state,
  AuthService,
  AUTH_EVENTS) {

  console.log('AuthCtrl');

  this.data = AuthService.formData;

  /**
   * Handle login click from UI
   */
  this.login = function (data) {
    
    console.log('AuthCtrl.login', data);

    try {
      $ionicLoading.show();

      AuthService.login(data)
      .then(function (firebaseUser) {
        console.log("Signed in as:", firebaseUser);
        // $state.go('tab.dash', {
        //   location: "replace"
        // });
      })
      .catch(function (error) {
        console.log("Authentication failed:", error);

        $ionicPopup.alert({
          title: 'Oops',
          template: error.message
        });
      })
      .finally(function() {
        $ionicLoading.hide();
      });
      
    } catch (e) {

      var msg = 'An uknown error has occured. ' + e;
      switch (e) {
        case AUTH_EVENTS.invalidFormData:
          msg = 'Your email and password cannot be blank'; 
          break;
      }

      $ionicPopup.alert({
        title: 'Oops',
        template: msg
      });
      $ionicLoading.hide();      
    };
  
  };  // eo AuthCtrl.login

  this.logout = function () {
    AuthService.logout();
  };
};

/**
 * Main tab controller
 */
function DashCtrl(AuthService) {
  console.log('DashCtrl');

  this.logout = function () {
    AuthService.logout();
  };
};  // eo DashCtrl