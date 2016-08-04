angular.module('starter.services', [])
.service('AuthService', AuthService)
.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {

  // console.log('AuthInterceptor');

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
  $ionicPopup,
  $ionicLoading,
  $firebaseAuth,
  AUTH_EVENTS,
  PouchDbService) {

  // console.log('AuthService');

  var _that = this;
  var _auth = $firebaseAuth();
  var _unregisterAuthCallback = null;
  var _authData = null;
  var _db = PouchDbService.db();
  var _AUTH_ID = 'auth';

  this.formData = {u: null, p: null};

  function resetHistory() {
    $ionicHistory.clearHistory();
    $ionicHistory.nextViewOptions({
      disableBack: true,
      disableAnimate: true,
      historyRoot: true
    });
  };

  function showLogin() {
    resetHistory();
    return $state.go('login', {
      location: "replace"
    });
  };

  function onAuthStateChange(data) {

    var _pouchDb = PouchDbService.db();
    
    console.log('AuthService -> $firebaseAuth.onAuthStateChange event triggered, Data:', data, $state);

    _authData = null;

    /**
     * If data is null then its a logout event, else its a sign on event
     */
    if (null === data) {

      // Delete the pouchdb document
      try {
        _pouchDb.get(_AUTH_ID)
        .then(function (doc) {
          console.log('_pouchDb.get(_AUTH_ID) result: ', doc)
          return _pouchDb.remove(doc);
        })
        .then(function () {
          showLogin();
        })
        .catch(function (err) {
          switch (err.status) {
            case 404:
              // go to login screen since the document is already deleted
              showLogin();
              break;
              
            default:
            console.error('AuthService -> onAuthStateChange. Exception: ', err);
          };
        });
      } catch (err) {
        console.error('AuthService -> onAuthStateChange. Exception: ', err);
      };
    
      // $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
    } else {

      // Check the email is verified before proceeding
      if(!data.emailVerified) {
        console.log('Email address is not verified. Exiting... ', data);
        $rootScope.$broadcast(AUTH_EVENTS.emailNotVerified);
        return _that.logout();
      };

      _authData = data;

      // Save the data in pouchdb storage
      _pouchDb.put({
        _id: _AUTH_ID,
        data: data
      })
      .then(function () {
        resetHistory();
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
  this.monitorAuthChange = function () {
    // console.log('AuthService.monitorAuthChange - monitoring for Firebase auth events');
    _unregisterAuthCallback = _auth.$onAuthStateChanged(onAuthStateChange, _that);
  };

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
    var usr = _auth.$getAuth();
    console.log('AuthService.isAuthenticated:', null !== usr);
    if (!usr || !usr.emailVerified) {
      _authData = null;
    }
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

  this.signup = function (data) {

    var defer = $q.defer();
    
    _auth.$createUserWithEmailAndPassword(data.u, data.p)
    .then(function (result) {
      out = result;
      console.log('AuthService.signup - $firebaseAuth.$createUserWithEmailAndPassword success', result);
      result.sendEmailVerification();
      defer.resolve(out);
    })
    .catch(function (result) {
      console.log('AuthService.signup - $firebaseAuth.$createUserWithEmailAndPassword fail', result);  
      defer.reject(result);
    })
    .finally(function () {
    });

    return defer.promise;
  };  // eo AuthService.signup

};  // eo AuthService