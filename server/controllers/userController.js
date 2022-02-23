const config = require('config');
const _ = require('lodash');
const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const jwtUtils = require('../utils/jwt');

exports.authorization = asyncHandler(async (req, res) => {
  const { username, password, confirm_creation: confirmCreation } = req.body;
  let user = await User.findOne({ username });
  const userExists = !!user;
  if (user) {
    if (!user.active) {
      const err = new Error('User is inactive');
      err.status = 403;
      err.error = 'AuthenticationError';
      throw err;
    }
    await user.login({ password });
  } else {
    // if we reached here then `user` is null
    user = await User.register({
      username,
      password,
      confirmCreation,
    });
  }
  res.cookie(
    'token',
    jwtUtils.signJWT(
      { username },
      { httpOnly: true, expires: user.sessionExpiresAt },
    ),
  );
  req.app.io.sockets.emit('updateUsers');
  res.json({
    username: user.username,
    is_new: !userExists && !confirmCreation,
    show_welcome_message: !userExists,
  });
});

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');

  if (!req.user) {
    res.redirect('/');
    return;
  }
  const { username } = req.user;
  const user = await User.findOne({ username });
  await user.logout();
  req.app.io.sockets.emit('updateUsers');
  req.app.io.sockets.emit('logout', user.id);
  res.redirect('/');
});

exports.getUsers = asyncHandler(async (req, res) => {
  const {
    limit = config.pagination.defaultPageSize,
    current = config.pagination.defaultStartPage,
    username,
    status,
    near,
    latitude,
    longitude,
  } = req.query;

  let active;
  if (req.user.role !== 'administrator') {
    active = true;
  }

  const filters = _.omitBy(
    {
      username: username ? new RegExp(username, 'i') : undefined,
      status,
      active,
      // only display online users
      sessionExpiresAt: near
        ? {
            $gte: new Date(),
          }
        : null,
    },
    _.isNil,
  );
  const geoNear = near
    ? {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: 'dist',
          maxDistance: parseFloat(near),
          minDistance: 0,
        },
      }
    : null;

  const currentNumber = parseInt(current, 10);
  const limitNumber = parseInt(limit, 10);

  const { total, data } = await User.list({
    currentUserId: req.user._id,
    filters,
    geoNear,
    skip: currentNumber - 1,
    limit: limitNumber,
  });
  res.json({
    total,
    limit: limitNumber,
    current: currentNumber,
    data,
  });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { username } = req.params;

  let user = await User.findOne({ username });
  user = await user.updateStatus(status);

  res.json(user);
});

exports.updateLocation = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { longitude, latitude } = req.body;

  let user = await User.findOne({ username });
  await user.updateOne({
    location: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    },
  });
  user = await User.findOne({ username });
  req.app.io.emit('locationUpdated', user);

  res.json(user);
});

exports.getStatus = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  res.json({
    status: user.status,
  });
});

exports.getQualifications = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  res.json({
    qualifications: user.qualifications,
  });
});

exports.updateQualifications = asyncHandler(async (req, res) => {
  const { list } = req.body;
  const { username } = req.params;

  const user = await User.findOne({ username });
  await user.updateQualifications(list);

  res.json({ result: 'ok' });
});

exports.getUser = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  res.json({ user });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const newUserAttributes = _.omitBy({ ...req.body.user }, _.isNil);

  const { role, username: loggedInUsername } = req.user;
  if (loggedInUsername !== username && role !== 'administrator') {
    const err = new Error('User should login to perform this operation');
    err.status = 401;
    err.error = 'AuthenticationError';
    throw err;
  }

  const newUser = await User.findOneAndUpdate(
    {
      username,
    },
    {
      ...newUserAttributes,
    },
    {
      runValidators: true,
      context: 'query',
      new: true,
      useFindAndModify: false,
    },
  );

  if (newUser.active === false) {
    req.app.io.to(newUser._id).emit('kickout', newUser);
  }

  res.json(newUser);
});

exports.renderUserProfile = asyncHandler(async (req, res) => {
  const isAdministrator = req.user.role === 'administrator';

  const { username } = req.params;
  const isSelf = req.user.username === username;

  const user = await User.findOne({ username });

  res.render('user-profile', {
    layout: 'no-footer-layout',
    user,
    isAdministrator,
    isSelf,
    title: 'User profile',
    page: 'user-profile',
  });
});
