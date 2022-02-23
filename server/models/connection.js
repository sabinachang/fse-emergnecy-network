const mongoose = require('mongoose');
const config = require('config');
const logger = require('../utils/logger');

module.exports = async (databaseUrl, dbName) => {
  mongoose.set('useCreateIndex', true);

  await mongoose.connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName,
  });

  const db = mongoose.connection;
  db.on('error', (err) => logger.error(err.message));
  db.on('open', () => {
    logger.info(`[DATABASE] connected to ${config.db.url}`);
  });

  return mongoose;
};
