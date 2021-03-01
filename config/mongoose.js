const mongoose = require('mongoose');

const mongo = {
  uri: process.env.MONGO_URI
}

// Exit application on error
mongoose.connection.on('error', (err) => {
  console.log(err);
  process.exit(-1);
});

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
exports.connect = () => {
  mongoose
    .connect(mongo.uri, {
      useCreateIndex: true,
      keepAlive: 1,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => console.log('mongoDB connected...'));
  return mongoose.connection;
};
