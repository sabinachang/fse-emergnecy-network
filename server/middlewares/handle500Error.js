const Youch = require('youch');
const config = require('config');
const _ = require('lodash');
const logger = require('../utils/logger.js');

module.exports = () => (err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack });
  if (req.accepts('json')) {
    return res.status(500).json(
      _.omitBy(
        {
          message: err.message,
          stack: config.env === 'development' ? err.stack : null,
        },
        (n) => !n,
      ),
    );
  }
  if (config.env === 'development') {
    const youch = new Youch(err, req);
    return youch.toHTML().then((html) => res.status(500).send(html));
  }
  return next(err);
};
