const User = require('../models/user');

module.exports = () => (req, res, next) => {
  if (!req.user) {
    const err = new Error('User should login to perform this operation');
    err.status = 401;
    err.error = 'AuthenticationError';
    next(err);
    return;
  }

  User.findOne({ username: req.user.username })
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(next);
};
