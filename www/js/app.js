angular.module('starter', [
  'ionic', 
  'starter.controllers', 
  'starter.services', 
  'firebase'
])

/**
 * Authentication related constants
 */
.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})

.run(function($ionicPlatform) {

  console.log('In app.run function');

  $ionicPlatform.ready(function() {
    
    console.log('$ionicPlatform.ready is resolved');

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

  console.log('in app.config function');

  $stateProvider

  /**
   * This state is used to initialized all resources before the app starts
   * Should happen only once at startup of the app and before the login page
   * is displayed. Any other resolve methods should be added here
   */
  .state('init', {
    url: '/init',
    templateUrl: 'templates/init.html',
    controller: 'InitCtrl as initCtrl',
    resolve: {
      'resolvePouchDb': function (PouchDbService) {
        console.log('stateProvider - state:init. resolve: resolvePouchDb');
        return PouchDbService.init();
      }
    },
  })

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
    templateUrl: 'templates/tabs.html',
  })

  // Each tab has its own nav history stack:
  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl as dashCtrl',
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise(function ($injector) {
    $state = $injector.get('$state');
    $state.go('init');
  });

});