module.exports = {
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'debug',
  db: {
    url: process.env.MONGODB_URL || 'mongodb://localhost/sa4_esn',
  },
  jwt: {
    secret: 'uD9FI2RM5Ds7K1BoclZl',
    algorithms: ['HS256'],
  },
  pagination: {
    defaultPageSize: 20,
    defaultStartPage: 1,
  },
};
