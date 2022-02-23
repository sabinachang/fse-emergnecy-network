const configureDatabase = require('../../models/connection');
const userController = require('../userController');
const User = require('../../models/user');

let connection;

beforeAll(async () => {
  connection = await configureDatabase(
    global.__MONGO_URI__,
    global.__MONGO_DB_NAME__,
  );
});
beforeEach(async () => {
  await User.deleteMany();
});
afterAll(async () => {
  await connection.disconnect();
});

test('update location emits `updateLocation` event', async () => {
  let user = await User.create({
    username: 'user1',
    password: 'pwd123',
    sessionExpiresAt: Date.now() + 10000,
  });
  const req = {
    user,
    body: {
      longitude: 1,
      latitude: 1,
    },
    params: {
      username: 'user1',
    },
    app: {
      io: {
        emit: jest.fn(),
      },
    },
  };
  const res = {
    json: jest.fn(),
  };
  await userController.updateLocation(req, res, () => {});
  user = await User.findOne({ username: 'user1' });
  expect(user.toJSON().coordinates).toEqual({
    longitude: 1,
    latitude: 1,
  });
  expect(req.app.io.emit).toHaveBeenCalledWith('locationUpdated', user);
  expect(res.json).toHaveBeenCalledWith(user);
});

test('logout emits `updateUsers` and `logout` events', async () => {
  const user = await User.create({
    username: 'user1',
    password: 'pwd123',
    sessionExpiresAt: Date.now() + 10000,
  });
  const req = {
    user,
    app: {
      io: {
        sockets: {
          emit: jest.fn(),
        },
      },
    },
  };
  const res = {
    clearCookie: jest.fn(),
    redirect: jest.fn(),
  };
  await userController.logout(req, res, () => {});
  expect(res.clearCookie).toHaveBeenCalledWith('token');
  expect(req.app.io.sockets.emit.mock.calls[0]).toEqual(['updateUsers']);
  expect(req.app.io.sockets.emit.mock.calls[1]).toEqual([
    'logout',
    user._id.toString(),
  ]);
  expect(res.redirect).toHaveBeenCalledWith('/');
});

test('logout when there is no user', async () => {
  const req = {};
  const res = {
    clearCookie: jest.fn(),
    redirect: jest.fn(),
  };
  await userController.logout(req, res, () => {});
  expect(res.clearCookie).toHaveBeenCalledWith('token');
  expect(res.redirect).toHaveBeenCalledWith('/');
});
