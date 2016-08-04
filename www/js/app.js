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
  notAuthorized: 'auth-not-authorized',
  emailNotVerified: 'auth-email-not-verified',
  unknownProvider: 'auth-unknown-provider',
  invalidFormData: 'auth-invalid-form-data',
  loggedOut: 'auth-logged-out'
})

.run(function(
  $ionicPlatform,
  $rootScope,
  $state,
  $ionicHistory,
  PouchDbService) {

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

    PouchDbService.init().then(function () {
      // PouchDbService.replicate();
      console.log('>>> PouchDbService.init() completed. Moving on...');
      
      // Set the next view as the root view so that the user does not see
      // the loading screen if they press the back key in android
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
        historyRoot: true
      });

      $state.go('init', null, {
        location: 'replace'
      });

      $rootScope.$apply();
    });

  });
})

.config(function($stateProvider, $urlRouterProvider) {

  console.log('in app.config function');

  /**
   * Temporary state that waits for the platform ready to complete before going to the init state
   */
  $stateProvider
  .state('loading', {
    url: '/loading',
    templateUrl: 'templates/init.html',
  })

  /**
   * This state is used to initialized all resources before the app starts
   * Should happen only once at startup of the app and before the login page
   * is displayed.
   */
  .state('init', {
    url: '/init',
    templateUrl: 'templates/init.html',
    controller: 'InitCtrl as initCtrl' 
  })

  // Main landing page if user is not authenticated
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'AuthCtrl as authCtrl'
  })

  // Sign up screen
  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'AuthCtrl as authCtrl'
  })
  
  // Setup an abstract state for the tabs directive
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

  // If none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise(function ($injector) {
    $state = $injector.get('$state');
    $state.go('loading');
  });

});