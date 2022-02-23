module.exports = () => (err, req, res, next) => {
  // Catch jwt token invalid error
  if (err.name === 'UnauthorizedError') {
    res.clearCookie('token');
    if (req.accepts(['json', 'html']) === 'html') {
      res.redirect('/logout');
      return;
    }
    const e = new Error('User should login to perform this operation');
    e.error = 'AuthenticationError';
    e.status = 401;
    next(e);
    return;
  }
  next(err);
};
