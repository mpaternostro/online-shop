const mongodb = require("mongodb");

const { MongoClient } = mongodb;

/**
 * @type {import('mongodb').Db} db
 */
let db;

const mongoConnect = (callback) => {
  return MongoClient.connect(process.env.MONGO_DB_URI)
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
