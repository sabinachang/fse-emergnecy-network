const configureDatabase = require('../connection');
const StatusHistory = require('../statusHistory');
const User = require('../user');
const fakeUsers = require('./fixtures/users');

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

test('toJSON', async () => {
  const user = await User.register({
    username: 'Johndoe',
    password: 'pwd123',
    confirmCreation: true,
  });
  expect(user.toJSON()).toEqual({
    id: expect.any(String),
    active: true,
    username: 'Johndoe',
    online: true,
    role: 'citizen',
    status_last_updated_at: undefined,
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    qualifications: [],
  });
});

test('password is hashed', async () => {
  const user = await User.create({
    username: 'John',
    password: '1234',
    sessionExpiresAt: Date.now() + User.SESSION_EXPIRATION_IN_MS,
  });
  expect(user.password).not.toEqual('1234');
});

test('password is rehashed when password is updated', async () => {
  let user = await User.create({
    username: 'John',
    password: '1234',
    sessionExpiresAt: Date.now() + User.SESSION_EXPIRATION_IN_MS,
  });
  const originalPassword = user.password;
  user = await user.updateOne({ password: '5678' });
  expect(originalPassword).not.toEqual(user.password);
});

test('password is not changed when other properties are changed', async () => {
  let user = await User.create({
    username: 'John',
    password: '1234',
    sessionExpiresAt: Date.now() + User.SESSION_EXPIRATION_IN_MS,
  });
  const originalPassword = user.password;
  await user.updateOne({ sessionExpiresAt: Date.now() });
  user = await User.findOne({ username: 'John' });
  expect(originalPassword).toEqual(user.password);
});

test('Could dry run validation and response error', async () => {
  try {
    await User.register({
      username: 'us',
      password: 'pwd456',
      confirmCreation: false,
    });
    expect(true).toEqual(false, '');
  } catch (e) {
    expect(e.status).toEqual(422);
    expect(e.error).toEqual('ValidationError');
    expect(e.message).toEqual(
      'User validation failed: username: Path `username` (`us`) is shorter than the minimum allowed length (3).',
    );
  }
});

test('Could dry run validation and response user', async () => {
  const user = await User.register({
    username: 'john',
    password: 'pwd456',
    confirmCreation: false,
  });
  expect(user.username).toEqual('john');
});

test('Should not create user if username is under 3 characters', async () => {
  try {
    await User.register({
      username: 'us',
      password: 'pwd123',
      confirmCreation: true,
    });
    expect(true).toEqual(false, '');
  } catch (e) {
    expect(e.status).toEqual(422);
    expect(e.error).toEqual('ValidationError');
    expect(e.message).toEqual(
      'User validation failed: username: Path `username` (`us`) is shorter than the minimum allowed length (3).',
    );
  }
});

test('Should not create user if username is in the block list', async () => {
  try {
    await User.register({
      username: 'username',
      password: 'pwd123',
      confirmCreation: true,
    });
    expect(false).toBe(true);
  } catch (e) {
    expect(e.errors.username.kind).toEqual('user defined');
  }
});

test('Should not create user if username is not unique', async () => {
  const user1 = await User.register({
    username: 'John',
    password: 'pwd123',
    confirmCreation: true,
  });

  try {
    await User.register({
      username: user1.username,
      password: 'another password',
      confirmCreation: true,
    });
    expect(false).toBe(true);
  } catch (e) {
    expect(e.status).toEqual(409);
    expect(e.error).toEqual('ValidationError');
    expect(e.message).toEqual(
      'User validation failed: Username is already occupied',
    );
  }
});

test('Should not create user if password is under 4 characters', async () => {
  try {
    await User.register({
      username: 'John',
      password: 'pwd',
      confirmCreation: true,
    });
    expect(false).toBe(true);
  } catch (e) {
    expect(e.status).toEqual(422);
    expect(e.error).toEqual('ValidationError');
    expect(e.message).toEqual(
      'User validation failed: password: Path `password` (`pwd`) is shorter than the minimum allowed length (4).',
    );
  }
});

test('Should validate password when login', async () => {
  const password = 'def,jie';
  const user = await User.register({
    username: 'John',
    password,
    confirmCreation: true,
  });
  try {
    await user.login({ password: 'abcde' });
    expect(false).toEqual(true);
  } catch (e) {
    expect(e.status).toEqual(422);
    expect(e.message).toEqual('Incorreact username or password');
  }
});

test('Should update session expiresAt when login', async () => {
  const password = 'def,jie';
  const user = await User.register({
    username: 'John',
    password,
    confirmCreation: true,
  });

  const dateNow = Date.now() + User.SESSION_EXPIRATION_IN_MS;

  await user.login({ password });

  const newUser = await User.findOne({
    username: 'John',
  });

  expect(newUser.sessionExpiresAt.getTime()).toBeGreaterThan(dateNow);
});

test('Should update session expiresAt when logout', async () => {
  const sessionExpiresAt = Date.now() + User.SESSION_EXPIRATION_IN_MS;

  const user = await User.register({
    username: 'John',
    password: 'pwd123',
    confirmCreation: true,
  });

  await user.logout();

  const newUser = await User.findOne({
    username: 'John',
  });

  expect(newUser.sessionExpiresAt.getTime()).toBeLessThan(sessionExpiresAt);
});

test('Should create history when update status', async () => {
  const user = await User.register({
    username: 'John',
    password: 'pwd123',
    confirmCreation: true,
  });

  await user.updateStatus('Ok');

  const statusHistory = await StatusHistory.findOne();
  expect(statusHistory.status).toEqual('Ok');
});

test('Should get users by username regex', async () => {
  await User.insertMany(fakeUsers);
  const filters = {
    username: /ton/i,
  };
  const { data: users } = await User.list({ filters, limit: 10, skip: 0 });

  expect(users.length).toBe(1);
  expect(users[0].username).toBe('Tony');
});

test('Should get users by status', async () => {
  await User.insertMany(fakeUsers);
  const filters = {
    status: 'Emergency',
  };
  const { data: users } = await User.list({ filters, limit: 10, skip: 0 });

  expect(users.length).toBe(1);
  expect(users[0].status).toBe('Emergency');
});

test('Could populate a list of statuses', async () => {
  const user = await User.register({
    username: 'John',
    password: 'pswd',
    confirmCreation: true,
  });
  await user.updateStatus('Ok');
  await user.updateStatus('Emergency');
  await user.populate('statuses').execPopulate();
  expect(user.statuses.length).toEqual(2);
});
