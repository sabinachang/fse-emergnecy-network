const axios = require('axios');
const app = require('../app');
const configureDatabase = require('../models/connection');
const io = require('../socket');
const User = require('../models/user');
const jwtUtils = require('../utils/jwt');

const Cookie = `token=${jwtUtils.signJWT({ username: 'myUser' })}`;

const coords = {
  latitude: 37.39052,
  longitude: -122.084851,
};

function randomRange(low, hi) {
  return Math.random() * (low - hi) + hi;
}

let server;
let connection;
let request;
beforeAll(async (done) => {
  connection = await configureDatabase(
    global.__MONGO_URI__,
    global.__MONGO_DB_NAME__,
  );
  app.io = io;
  server = app.listen(() => {
    const { port } = server.address();
    request = axios.create({
      baseURL: `http://localhost:${port}`,
      headers: {
        Cookie,
      },
    });
    done();
  });
});
beforeEach(async () => {
  await User.create({
    username: 'myUser',
    password: '12345',
    sessionExpiresAt: Date.now() + 2 * 60 * 60 * 1000,
    location: {
      type: 'Point',
      coordinates: [coords.longitude, coords.latitude],
    },
  });
});
afterEach(async () => {
  await User.deleteMany();
});
afterAll(async () => {
  await connection.disconnect();
  await server.close();
});

test('Displays nearby online users upon search', async () => {
  await User.create({
    username: 'near1',
    password: '12345',
    status: 'Warning',
    sessionExpiresAt: Date.now() + 2 * 60 * 60 * 1000,
    location: {
      type: 'Point',
      coordinates: [
        coords.longitude + randomRange(-0.05, 0.05),
        coords.latitude + randomRange(-0.05, 0.05),
      ],
    },
  });
  await User.create({
    username: 'near2',
    password: '12345',
    status: 'Ok',
    sessionExpiresAt: Date.now() + 2 * 60 * 60 * 1000,
    location: {
      type: 'Point',
      coordinates: [
        coords.longitude + randomRange(-0.05, 0.05),
        coords.latitude + randomRange(-0.05, 0.05),
      ],
    },
  });
  const res = await request.get(`/api/users`, {
    params: {
      near: 10000,
      longitude: coords.longitude,
      latitude: coords.latitude,
    },
  });
  expect(res.data.data.length).toBe(2);
  expect(res.data.total).toBe(2);
});

test('Offline users are not shown', async () => {
  await User.create({
    username: 'near1',
    password: '12345',
    status: 'Warning',
    sessionExpiresAt: Date.now() - 2 * 60 * 60 * 1000,
    location: {
      type: 'Point',
      coordinates: [
        coords.longitude + randomRange(-0.05, 0.05),
        coords.latitude + randomRange(-0.05, 0.05),
      ],
    },
  });
  await User.create({
    username: 'near2',
    password: '12345',
    status: 'Ok',
    sessionExpiresAt: Date.now() + 2 * 60 * 60 * 1000,
    location: {
      type: 'Point',
      coordinates: [
        coords.longitude + randomRange(-0.05, 0.05),
        coords.latitude + randomRange(-0.05, 0.05),
      ],
    },
  });
  const res = await request.get(`/api/users`, {
    params: {
      near: 10000,
      longitude: coords.longitude,
      latitude: coords.latitude,
    },
  });
  expect(res.data.data.length).toBe(1);
  expect(res.data.total).toBe(1);
});

test('Could mix use of status filter', async () => {
  await User.create({
    username: 'near1',
    password: '12345',
    status: 'Warning',
    sessionExpiresAt: Date.now() + 2 * 60 * 60 * 1000,
    location: {
      type: 'Point',
      coordinates: [
        coords.longitude + randomRange(-0.05, 0.05),
        coords.latitude + randomRange(-0.05, 0.05),
      ],
    },
  });
  await User.create({
    username: 'near2',
    password: '12345',
    status: 'Ok',
    sessionExpiresAt: Date.now() + 2 * 60 * 60 * 1000,
    location: {
      type: 'Point',
      coordinates: [
        coords.longitude + randomRange(-0.05, 0.05),
        coords.latitude + randomRange(-0.05, 0.05),
      ],
    },
  });
  const res = await request.get(`/api/users`, {
    params: {
      near: 10000,
      longitude: coords.longitude,
      latitude: coords.latitude,
      status: 'Ok',
    },
  });
  expect(res.data.data.length).toBe(1);
  expect(res.data.total).toBe(1);
});
