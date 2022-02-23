const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('config');
const server = require('./server');
const logger = require('./utils/logger');
const jwtUtil = require('./utils/jwt');
const User = require('./models/user');

const io = socketio(server);

io.on('connection', async (socket) => {
  const jwtToken = jwtUtil.getJwtToken(socket.request);
  if (!jwtToken) {
    return;
  }
  let username;
  try {
    ({ username } = jwt.verify(jwtToken, config.jwt.secret, {
      algorithms: config.jwt.algorithms,
    }));
  } catch (e) {
    logger.warning(e);
    return;
  }

  const user = await User.findOne({ username });
  socket.join(user._id);
  logger.info(`New Web Socket connection... ${user._id}`);
  socket.on('disconnect', () => {
    logger.info(`WS disconnected... ${user._id}`);
  });
});

module.exports = io;
