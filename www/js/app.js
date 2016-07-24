angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'firebase'])

/**
 * Authentication related constants
 */
.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  // main landing page if user is not authenticated
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'AuthCtrl as authCtrl'
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:
  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl as dashCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise(function ($injector) {
    $state = $injector.get('$state');
    $state.go('tab.dash');
  });

})

/**
 * Intercept all state changes
 */
.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {

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
        event.preventDefault();
        $state.go('login');
      }
    }
  });
});
