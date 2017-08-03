'use strict';

const Transaction = require("orm-transaction");
const ORM = require("orm");

let Tables = [];
let DbConnectionUrl = null;

module.exports = {
  setDbConnectionUrl: function(url) {
    DbConnectionUrl = url;
  },

  middleware: function(app) {
    var that = this;
    app.use(ORM.express(DbConnectionUrl, {
      define: function(db, models, next) {
        db.use(Transaction);
        that.defineModels(db, models);
        next();
      }
    }));
  },

  Connect: function(cb) {
    ORM.connect(DbConnectionUrl, cb);
  },

  addTable: function(table) {
    Tables.push(table);
  },

  defineModels: function(db, models) {
    Tables.forEach(function(table) {
      models[table.ModelName] = db.define(table.TableName, table.Columns,
        table.Options);
    });
  },

  Update: function(db) {
    this.defineModels(db, db.models);
    return new Promise(function(resolve, reject) {
      db.sync(function(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }
};