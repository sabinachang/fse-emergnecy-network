const axios = require('axios');
const configureDatabase = require('../models/connection');
const StatusHistory = require('../models/statusHistory');
const User = require('../models/user');
const Channel = require('../models/channel');
require('../models/message');
require('../models/matchingPost');
const io = require('../socket');

const jwtUtils = require('../utils/jwt');

// Initiate Server
const app = require('../app');

let server;
let connection;
let request;
beforeAll(async (done) => {
  connection = await configureDatabase(
    global.__MONGO_URI__,
    global.__MONGO_DB_NAME__,
  );
  server = app.listen(() => {
    const { port } = server.address();
    request = axios.create({
      baseURL: `http://localhost:${port}`,
    });
    done();
  });
  app.io = io;
});
beforeEach(async () => {
  await User.deleteMany();
  await StatusHistory.deleteMany();
});
afterAll(async () => {
  await connection.disconnect();
  await server.close();
});

test('Can get matching posts of a user', async () => {
  const u1 = new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await u1.save();
  await User.create({
    username: 'John',
    password: '1234',
    sessionExpiresAt: Date.now(),
    qualifications: ['technician', 'rescuer'],
  });
  const channel = await Channel.fetch('public');
  await channel.addMessage({
    content: 'My friend is hurt, I need healthcare worker',
    status: 'Help',
    user: u1._id,
    helpTypes: ['healthcare worker', 'technician', 'firefighter'],
  });
  await channel.addMessage({
    content: 'My friend is hurt, I need help',
    status: 'Help',
    user: u1._id,
    helpTypes: ['healthcare worker', 'firefighter'],
  });

  const res = await request.get(`/api/matchingPosts`, {
    headers: {
      Cookie: `token=${jwtUtils.signJWT({ username: 'John' })}`,
    },
  });

  expect(res.data.data.length).toEqual(1);
});

test('Can get unread matching posts of a user', async () => {
  const u1 = new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await u1.save();
  await User.create({
    username: 'John',
    password: '1234',
    sessionExpiresAt: Date.now(),
    qualifications: ['technician', 'rescuer'],
  });
  const channel = await Channel.fetch('public');
  await channel.addMessage({
    content: 'My friend is hurt, I need healthcare worker',
    status: 'Help',
    user: u1._id,
    helpTypes: ['healthcare worker', 'technician', 'firefighter'],
  });
  await channel.addMessage({
    content: 'My friend is hurt, I need help',
    status: 'Help',
    user: u1._id,
    helpTypes: ['healthcare worker', 'firefighter'],
  });

  const res = await request.get(`/api/matchingPosts/count`, {
    headers: {
      Cookie: `token=${jwtUtils.signJWT({ username: 'John' })}`,
    },
  });

  expect(res.data.count).toEqual(1);
});
