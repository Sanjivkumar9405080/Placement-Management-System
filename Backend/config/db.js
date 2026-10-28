const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    const errorMsg = "MONGO_URI environment variable is not defined";
    console.error(`MongoDB Connection Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then((mongooseInstance) => {
        console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error(`MongoDB Connection Error: ${err.message}`);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;