'use strict';

const Logger = require('request-log4js').getLogger("db:repository");


function Repository(db, model) {
  this.db = db;
  this.model = model;
}

Repository.prototype.commit = function(tran, resolve, reject) {
  tran.commit(function(err) {
    if (err) {
      Logger.warn(null, "Transaction commit failed.\n", err);
      that.rollback(tran, function() {
        reject(err);
      });
      return;
    }

    Logger.debug(null, "Transaction commit successfully.");
    resolve();
  });
};

Repository.prototype.rollback = function(tran, callback) {
  tran.rollback(function(err) {
    if (err) {
      Logger.warn(null, "Transaction rollback failed.\n", err);
    }

    callback();
  });
};

Repository.prototype.transaction = function(callback) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that.db.transaction(function(err, tran) {
      if (err) {
        reject(err);
        return;
      }

      callback().then(function() {
        that.commit(tran, resolve, reject);
      }).catch(function(err) {
        that.rollback(tran, function() {
          reject(err);
        });
      });
    });
  });

};

Repository.prototype.create = function(data) {
  var that = this;
  return this.transaction(function() {
    return that.__create(data);
  });
};

Repository.prototype.__create = function(data) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that.model.create(data, function(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
};

module.exports = Repository;