module.exports = () => (err, req, res, next) => {
  if (err.status && req.accepts('json')) {
    res.status(err.status).json({
      error: err.error,
      message: err.message,
    });
    return;
  }
  if (err.status) {
    res.status(err.status).render('4xx', {
      status: err.status,
      user: req.user,
    });
    return;
  }
  next(err);
};
