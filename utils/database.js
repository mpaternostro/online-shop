const mongodb = require("mongodb");

const { MongoClient } = mongodb;

/**
 * @type {import('mongodb').Db} db
 */
let db;

const mongoConnect = (callback) => {
  return MongoClient.connect(
    "mongodb+srv://marcelo:sxsvs8LWZ1r9LRUR@cluster0.ajczi.mongodb.net/online-shop?retryWrites=true&w=majority"
  )
    .then((client) => {
      console.log("Connected to MongoDB");
      db = client.db();
      callback();
    })
    .catch((err) => console.error(err));
};

const getDb = () => {
  if (db) {
    return db;
  }
  throw new Error("No database found");
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
