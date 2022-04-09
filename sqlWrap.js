'use strict'

const sql = require('sqlite3');
const util = require('util');


// old-fashioned database creation code 

// creates a new database object, not a 
// new database. 
const db = new sql.Database("activities.db");

// create another DB object for Profile
const db_profile = new sql.Database("profiles.db");

// check if database exists
let cmd = " SELECT name FROM sqlite_master WHERE type='table' AND name='ActivityTable' ";
let cmd_profile = " SELECT name FROM sqlite_master WHERE type='table' AND name='ProfileTable' ";

// ************************* Operation for ActivityTable **********************
db.get(cmd, function (err, val) {
  if (val == undefined) {
        console.log("No database file - creating one");
        createActivityTable();
  } else {
        console.log("Database file found");
  }
});

// called to create table if needed
function createActivityTable() {
  // explicitly declaring the rowIdNum protects rowids from changing if the 
  // table is compacted; not an issue here, but good practice
  const cmd = 'CREATE TABLE ActivityTable (rowIdNum INTEGER PRIMARY KEY, activity TEXT, date INTEGER, amount FLOAT, userid TEXT)';  // Added the userid as new column
  db.run(cmd, function(err, val) {
    if (err) {
      console.log("Database creation failure",err.message);
    } else {
      console.log("Created database");
    }
  });
}

// wrap all database commands in promises
db.run = util.promisify(db.run);
db.get = util.promisify(db.get);
db.all = util.promisify(db.all);

// empty all data from db
db.deleteEverything = async function() {
  await db.run("delete from ActivityTable");
  db.run("vacuum");
}
// ************************* End of ActivityTable ********************************

// ****************** Operation for Profile Table ********************************
// Profile table checking
db_profile.get(cmd_profile, (err, val) =>{
  if (val == undefined) {
    console.log("No Profile database file - creating one");
    createProfileTable();
  } else {
    console.log("Profile Database file found");
  }
});

// create Profile table if needed
function createProfileTable() {
  // explicitly declaring the rowIdNum protects rowids from changing if the 
  // table is compacted; not an issue here, but good practice
  const cmd = 'CREATE TABLE ProfileTable (rowIdNum INTEGER PRIMARY KEY, userid TEXT, firstName TEXT, lastName TEXT)';  // Added the userid as new column
  db_profile.run(cmd, function(err, val) {
    if (err) {
      console.log("Profile Database creation failure",err.message);
    } else {
      console.log("Created Profile database");
    }
  });
}

// wrap all database commands in promises
db_profile.run = util.promisify(db_profile.run);
db_profile.get = util.promisify(db_profile.get);
db_profile.all = util.promisify(db_profile.all);

// empty all data from db
db_profile.deleteEverything = async function() {
  await db.run("delete from ProfileTable");
  db.run("vacuum");
}
// ************************* End of ProfileTable ********************************

// allow code in index.js to use the db object
module.exports = {
  dbAct : db,
  dbProfile : db_profile
}