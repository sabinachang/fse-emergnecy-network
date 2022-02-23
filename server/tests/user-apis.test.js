const axios = require('axios');
const configureDatabase = require('../models/connection');
const StatusHistory = require('../models/statusHistory');
const User = require('../models/user');
const fakeUsers = require('../models/tests/fixtures/users');
const jwtUtils = require('../utils/jwt');

// Initiate Server
const app = require('../app');

const Cookie = `token=${jwtUtils.signJWT({ username: 'myUser' })}`;

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
});
beforeEach(async () => {
  await User.deleteMany();
  await StatusHistory.deleteMany();
});
afterAll(async () => {
  await connection.disconnect();
  await server.close();
});

test('Can get a list of users', async () => {
  await User.insertMany(fakeUsers);

  const res = await request.get(`/api/users`, {
    headers: { Cookie },
  });

  expect(res.status).toBe(200);
  expect(res.data.data.length).toBe(fakeUsers.length - 1);
});

test('Can get a list of users filter by username and status', async () => {
  await User.insertMany(fakeUsers);

  const res = await request.get(`/api/users?username=john&status=Ok`, {
    headers: { Cookie },
  });

  expect(res.status).toBe(200);
  const qualifiedUsers = fakeUsers.filter(
    (user) => user.username.match(/john/i) && user.status === 'Ok',
  );
  expect(res.data.data.length).toBe(qualifiedUsers.length);
});

test('Can get user status', async () => {
  await User.insertMany(fakeUsers);

  const res = await request.get(`/api/users/John/status`, {
    headers: { Cookie },
  });

  expect(res.status).toBe(200);

  const { status } = fakeUsers.find((user) => user.username === 'John');
  expect(res.data.status).toBe(status);
});

test('Can update user status', async () => {
  await User.insertMany(fakeUsers);

  const res = await request.patch(
    `/api/users/John/status`,
    {
      status: 'Emergency',
    },
    {
      headers: { Cookie },
    },
  );

  expect(res.status).toBe(200);

  const getRes = await request.get(`/api/users/John/status`, {
    headers: { Cookie },
  });

  expect(getRes.status).toBe(200);

  expect(getRes.data.status).toBe('Emergency');
});

test('Can update user profile', async () => {
  const users = await User.insertMany(fakeUsers);
  const aUser = users[0];
  const newUsername = 'Tony233';

  const res = await request.patch(
    `/api/users/${aUser.username}`,
    {
      user: {
        username: newUsername,
      },
    },
    { headers: { Cookie } },
  );

  expect(res.status).toBe(200);

  const getRes = await request.get(`/api/users/${newUsername}`, {
    headers: { Cookie },
  });
  expect(getRes.status).toBe(200);
  expect(getRes.data).not.toBeNull();
});

test('Will throw if the updated validation failed', async () => {
  const users = await User.insertMany(fakeUsers);
  const aUser = users[0];
  const newUsername = users[1].username;

  try {
    await request.patch(
      `/api/users/${aUser.username}`,
      {
        user: {
          username: newUsername,
        },
      },
      { headers: { Cookie } },
    );
  } catch (e) {
    expect(e.response.status).toEqual(500);
  }
});
