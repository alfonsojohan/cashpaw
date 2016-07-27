angular.module('starter.services')
/**
 * Define a singleton for PouchDb so that we can inject it into our
 * controllers and services
 */
.service('PouchDbService', PouchDbService)

/**
 * Define db related constants for use and to minimize typo errors
 */
.constant('POUCH_CONSTANTS', {
  'DB_NAME': 'cashpaw',
  'DB_ADAPTER': 'websql',
  'DB_LOCATION': 'default',
  'WILDCARD': '\uffff',
})
;

/**
 * Implementation of the PouchDbService
 */
function PouchDbService(
  POUCH_CONSTANTS) {

  console.log('PouchDbService');

  var _db = null;
  var _that = this;

  /**
   * Function to create if new, else will open existing db
   */
  this.init = function () {
    console.log('PouchDbService.init');

    _db = new PouchDB({
      name: POUCH_CONSTANTS.DB_NAME,
      adapter: POUCH_CONSTANTS.DB_ADAPTER,
      iosDatabaseLocation: POUCH_CONSTANTS.DB_LOCATION,    // This is now mandatory
      auto_compaction: true, 
    });

    /**
     * We now return a promise from the init function so that 
     * the app will wait for the init to complete before proceeding
     * Inspired from:
     * https://www.raymondcamden.com/2014/08/16/Ionic-and-Cordovas-DeviceReady-My-Solution/
     */
    return _db.info();
  };  

  this.db = function () {
      return _db;
  };

};  // eo PouchDbService