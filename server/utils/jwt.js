const jwt = require('jsonwebtoken');
const config = require('config');

exports.signJWT = ({ username }) => {
  return jwt.sign(
    // Payload
    {
      username,
    },
    config.jwt.secret,
    // Options
    {
      algorithm: config.jwt.algorithms[0],
      expiresIn: '2h',
    },
  );
};

exports.getJwtToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  const token =
    req.headers.cookie &&
    req.headers.cookie
      .split(';')
      .map((c) => c.trim())
      .find((str) => str.startsWith('token='));
  return token ? token.slice(6) : null;
};
