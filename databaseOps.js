'use strict'

// using a Promises-wrapped version of sqlite3
const db = require('./sqlWrap');

// SQL commands for ActivityTable
// TODO: need to add userid as parameter in SQL commands
const insertDB = "insert into ActivityTable (activity, date, amount, userid) values (?,?,?,?)"
const getOneDB = "select * from ActivityTable where activity = ? and date = ? and amount = ?";
const allDB = "select * from ActivityTable where activity = ?";


async function displayAll () {
  const findAll = "select * from ActivityTable";
  let res = await db.dbAct.all(findAll, []);

  console.log(res);
}

// delete incomplete activities
// TODO: only delete the given userid's acts - done
async function deleteAct (date, uid) {
  const deleteIncomplete = `DELETE FROM ActivityTable WHERE date <= ? AND amount = ? AND userid = ?`;
  await db.dbAct.run(deleteIncomplete, date, -1, uid);
}

// insert line in the DB
// data : [activity, date, amount, userid]
async function insert (data) {
  await db.dbAct.run(insertDB, data);
}

// find most recent data entry for completed activity
// TODO: only retrive the given userid's acts - done
async function mostRecentAct (uid) {
  const today = new Date();
  const mostRecentDB = "SELECT * FROM ActivityTable WHERE date < ? AND amount > ? AND userid = ? ORDER BY date DESC LIMIT 1";
  let res = await db.dbAct.get(mostRecentDB, [today.getTime(), 0, uid]);

  if (res == undefined) {
    // no target found from DB
    console.log("No recent completed activity found. --- line 42 DBO.js");
    return undefined;
  } else {
    // return the search results
    return res;
  }
}


// find most recent incomplete planed activity within past week
// TODO: only search the given userid's act - done
async function getRow (uid) {
  const today = new Date();   // TODO: NOT the PST date
  const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

  const withinWeekDB = "select * from ActivityTable where date >= ? and date <= ? and amount = ? and userid = ? ORDER BY date DESC LIMIT 1";
  let res = await db.dbAct.all(withinWeekDB, [weekAgo.getTime(), today.getTime(), -1, uid]);
 
  if (res.length == 0) {
    // no target found from DB
    console.log("No reminder activity this week.");
    return undefined;
  } else {
    // Need to delete the incomplete planed works
    deleteAct(res[0].date, uid); 
    return res;
  }
}

// retrive activity history within the given week
// TODO: only search the given userid's act - done
async function getWeek (date, act, uid) {
  const selectDate = new Date(date);
  const weekAgo = new Date(selectDate.getFullYear(), selectDate.getMonth(), selectDate.getDate() - 6);

  // find the given activity within a week range 
  // TODO: Need to check if the query find any results
  const withinWeekDB = "select * from ActivityTable where date >= ? and date <= ? and activity = ? and amount >= ? and userid = ? ORDER BY date ASC";
  let res = await db.dbAct.all(withinWeekDB, [weekAgo.getTime(), selectDate.getTime(), act, 0, uid]);
  return res;
}

// Search user in the Profile table
async function searchUser (uid) {
  // SQL commands for ProfileTable
  const cmd = "SELECT * FROM ProfileTable WHERE userid = ?";
  let res = await db.dbProfile.get(cmd, uid);

  console.log("@@@@@@@@@ IMPORTANT res's type is:", typeof res);
  // TODO: double check with res datatype
  if (res == undefined) {
    // no target found from DB
    console.log("No given user found");
    return undefined;
  } else {
    // return the search results
    return res;
  }
}

// insert new user to the Profile table
async function addUser (data) {
  // SQL commands for add user to ProfileTable
  const cmd = "insert into ProfileTable (userid, firstName, lastName) values (?,?,?)";
  await db.dbProfile.run(cmd, data);
}


async function resetDB () {
   // empty out database - probably you don't want to do this in your program
  await db.dbAct.deleteEverything();

  console.log("Database has been reset");
}


module.exports.insert = insert;
module.exports.getRow = getRow;
module.exports.getWeek = getWeek;
module.exports.resetDB = resetDB;
module.exports.displayAll = displayAll;
module.exports.mostRecentAct = mostRecentAct;
module.exports.searchUser = searchUser;
module.exports.addUser = addUser;