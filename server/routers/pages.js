const express = require('express');
const requiresAuth = require('../middlewares/requiresAuth');
const userController = require('../controllers/userController');
const channelController = require('../controllers/channelController');
const shelterController = require('../controllers/shelterController');

const render = (page) => (req, res) => {
  res.render(page, { user: req.user, page });
};

const renderNoFooter = (page, title) => (req, res) => {
  res.render(page, {
    layout: 'no-footer-layout',
    user: req.user,
    title,
    page,
  });
};

module.exports = express
  .Router()
  .get('/', (req, res) => {
    if (req.user) {
      return res.redirect('/emergencies');
    }
    return res.render('join-community', {
      user: null,
    });
  })
  .get('/logout', userController.logout)
  .get('/map', requiresAuth(), render('map'))
  .get('/users', requiresAuth(), render('users'))
  .get('/channels', requiresAuth(), render('channels'))
  .get('/channels/:id', requiresAuth(), channelController.renderChannelPage)
  .get('/shelters', requiresAuth(), render('shelters'))
  .get('/shelters/:id', requiresAuth(), shelterController.renderShelterPage)
  .get('/emergencies', requiresAuth(), render('emergencies'))
  .get(
    '/user-profile/:username',
    requiresAuth(),
    userController.renderUserProfile,
  )
  .get(
    '/match-posts',
    requiresAuth(),
    renderNoFooter('match-posts', 'Matching posts'),
  )
  .get(
    '/qualifications',
    requiresAuth(),
    renderNoFooter('qualifications', 'Edit qualifications'),
  );
