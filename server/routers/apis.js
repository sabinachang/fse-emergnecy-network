const express = require('express');
const requiresAuth = require('../middlewares/requiresAuth');
const userController = require('../controllers/userController');
const channelController = require('../controllers/channelController');
const messageController = require('../controllers/messageController');
const shelterController = require('../controllers/shelterController');
const emergencyController = require('../controllers/emergencyController');
const evacuationCenterController = require('../controllers/evacuationCenterController');
const matchingPostController = require('../controllers/matchingPostController');

module.exports = express
  .Router()
  .post('/authorizations', userController.authorization)
  .get('/users', requiresAuth(), userController.getUsers)
  .patch('/users/:username', requiresAuth(), userController.updateUser)
  .get('/users/:username', requiresAuth(), userController.getUser)
  .get('/users/:username/status', requiresAuth(), userController.getStatus)
  .patch('/users/:username/status', requiresAuth(), userController.updateStatus)
  .patch(
    '/users/:username/location',
    requiresAuth(),
    userController.updateLocation,
  )
  .post('/messages', requiresAuth(), messageController.createMessage)
  .get('/messages', requiresAuth(), messageController.getMessages)
  .get(
    '/evacuation-centers',
    requiresAuth(),
    evacuationCenterController.getEvacuationCenters,
  )
  .post('/channels', requiresAuth(), channelController.createChannel)
  .get(
    '/channels/private',
    requiresAuth(),
    channelController.getPrivateChannels,
  )
  .get('/channels/public', requiresAuth(), channelController.getPublicChannels)
  .get(
    '/channels/statushistories',
    requiresAuth(),
    channelController.getPeerStatusHistories,
  )
  .get(
    '/channels/:channelNameOrId',
    requiresAuth(),
    channelController.getChannel,
  )
  .patch(
    '/channels/:channelNameOrId',
    requiresAuth(),
    channelController.updateChannel,
  )
  .get('/shelters', requiresAuth(), shelterController.getShelters)
  .post('/shelters', requiresAuth(), shelterController.createShelter)
  .post('/emergencies', requiresAuth(), emergencyController.reportEmergency)
  .get('/emergencies', requiresAuth(), emergencyController.getEmergencies)
  .patch(
    '/users/:username/shelter',
    requiresAuth(),
    shelterController.updateShelter,
  )
  .get(
    '/users/:username/qualifications',
    requiresAuth(),
    userController.getQualifications,
  )
  .post(
    '/users/:username/qualifications',
    requiresAuth(),
    userController.updateQualifications,
  )
  .get(
    '/matchingPosts',
    requiresAuth(),
    matchingPostController.getMatchingPosts,
  )
  .get(
    '/matchingPosts/count',
    requiresAuth(),
    matchingPostController.getMatchPostCount,
  );
