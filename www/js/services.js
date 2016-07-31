angular.module('starter.services', [])
.service('AuthService', AuthService)
.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {

  console.log('AuthInterceptor');

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

function AuthService(
  $q, 
  $state,
  $rootScope,
  $ionicHistory,
  $firebaseAuth,
  AUTH_EVENTS,
  PouchDbService) {

  console.log('AuthService');

  var _that = this;
  var _auth = $firebaseAuth();
  var _unregisterAuthCallback = null;
  var _authData = null;
  var _db = PouchDbService.db();
  var _AUTH_ID = 'auth';

  this.formData = {u: null, p: null};

  function onAuthStateChange(data) {

    var _pouchDb = PouchDbService.db();
    
    console.log('AuthService -> $firebaseAuth.onAuthStateChange event triggered, Data:', data);

    // var _db = PouchDbService.db();
    console.log('onAuthStateChange');
    
    /**
     * If data is null then its a logout event, else its a sign on event
     */
    if (null === data) {
      _authData = null;

      // Delete the pouchdb document
      try {
        _pouchDb.get(_AUTH_ID)
        .then(function (doc) {
          return _pouchDb.remove(doc);
        })
        .then(function () {
          
          $ionicHistory.clearHistory();
          $ionicHistory.nextViewOptions({
            disableBack: true,
            disableAnimate: true,
            historyRoot: true
          });

          $state.go('login', {
            location: "replace"
          });
        })
        .error(function (err) {
          console.error('AuthService -> onAuthStateChange: ', err);
        });
      } catch (err) {
        console.error('AuthService -> onAuthStateChange. Exception: ', err);
      };
    
      // $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
    } else {
      _authData = data;

      // Save the data in pouchdb storage
      _pouchDb.put({
        _id: _AUTH_ID,
        data: data
      })
      .then(function () {
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({
          disableBack: true,
          disableAnimate: true,
          historyRoot: true
        });

        $state.go('tab.dash', {
          location: "replace"
        });
      })
      .catch(function (err) {
        console.error(err);
      });
    }
  };  // eo onAuthStateChange

  /**
   * Monitor the firebase auth state changes
   */
  _unregisterAuthCallback = _auth.$onAuthStateChanged(onAuthStateChange);

  this.init = function () {

    console.log('AuthService.init');

    var defer = $q.defer();

    PouchDbService.db().get('auth')
    .then(function (doc) {
      console.log('get auth: ', doc);
      _authData = doc;
      // return data;

      defer.resolve(_authData);
    })
    .catch(function (err) {
      console.log('AuthService.init - auth data err', err);

      if (404 == err.status) {
        defer.resolve(null);
      }
    });

    return defer.promise;
  };  // eo init

  /**
   * Sign out of firebase auth and clears the password
   */
  this.logout = function () {
    console.log('AuthService.logout');
    _that.formData.p = null;
    _auth.$signOut();
  };

  /**
   * Function to check if the user has authenticated
   */
  this.isAuthenticated = function () {
    console.log('TODO: AuthService.isAuthenticated');
    return (null !== _authData);
  };

  /**
   * Email and password login method
   */
  this.login = function (data) {

    if (!data.u || !data.p) {
      throw AUTH_EVENTS.invalidFormData;
    }

    console.log('AuthService.login', data);
    
    return _auth.$signInWithEmailAndPassword(data.u, data.p);
  };

  /**
   * Social login using one of the providers from firebase
   */
  this.socialLogin = function (provider) {

    switch (provider) {
      case 'google':
        // do nothing since the provider is valid
        break;
    
      default:
        throw AUTH_EVENTS.unknownProvider;
    };
  };

};  // eo AuthService