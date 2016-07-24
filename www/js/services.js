angular.module('starter.services', [])
.service('AuthService', AuthService)
.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {

  console.log('AuthInterceptor init');

  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});

function AuthService($firebaseAuth) {

  console.log('AuthService init');

  this.logout = function () {
    console.log('TODO: AuthService.logout');
  };

  this.isAuthenticated = function () {
    console.log('TODO: AuthService.isAuthenticated');
    return false;
  };

  this.login = function (uid, pwd) {
    
    console.log('AuthService.login', uid, pwd);

    var auth = $firebaseAuth();

    // login with email / password combo
    return auth.$signInWithEmailAndPassword("ajohan@yahoo.com", "password");
    
    // .then(function (firebaseUser) {
    //   console.log("Signed in as:", firebaseUser.uid);
    // }).catch(function (error) {
    //   console.log("Authentication failed:", error);
    // });
  };
};  // eo AuthService