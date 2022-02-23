const config = require('config');
const server = require('./server');
const logger = require('./utils/logger');
const io = require('./socket');
const app = require('./app');
// connects database
const configureDatabase = require('./models/connection');

configureDatabase(config.db.url).then(async (mongoose) => {
  const User = mongoose.model('User');
  const admin = await User.findOne({
    username: 'ESNAdmin',
  });
  if (!admin) {
    await User.create({
      username: 'ESNAdmin',
      password: 'admin',
      role: 'administrator',
      status: 'Ok',
      sessionExpiresAt: new Date(),
    });
  }
});

// so in controller, you could use req.app.io to refernece socket io instance as well
app.io = io;

server.listen(process.env.PORT || 6002, () => {
  logger.info(`[SERVER] listening to ${process.env.PORT || 6002}`);
});
