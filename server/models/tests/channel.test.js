const configureDatabase = require('../connection');
const User = require('../user');
const Channel = require('../channel');
require('../message');
require('../matchingPost');

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

test('create new channel with first time users', async () => {
  await new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  }).save();
  await new User({
    username: 'username2',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  }).save();

  const channel = await Channel.findOrCreate({
    usernames: ['username1', 'username2'],
  });
  expect(channel.created).toEqual(true);
});

test('find channel for returning users', async () => {
  await new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  }).save();
  await new User({
    username: 'username2',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  }).save();

  await Channel.findOrCreate({ usernames: ['username1', 'username2'] });
  const channel = await Channel.findOrCreate({
    usernames: ['username1', 'username2'],
  });

  expect(channel.created).toEqual(false);
});

test('fetch public channel', async () => {
  const channel = await Channel.fetch('public');
  expect(channel.name).toEqual('public');
});

test('fetch announcement channel', async () => {
  const channel = await Channel.fetch('announcement');
  expect(channel.name).toEqual('announcement');
});

test('message is stored to correct channel', async () => {
  const u1 = new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await u1.save();
  const u2 = new User({
    username: 'username2',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await u2.save();

  const { doc } = await Channel.findOrCreate({
    usernames: [u1.username, u2.username],
  });
  await doc.addMessage({
    content: 'Private msg 1',
    status: 'Ok',
    user: u1._id,
  });
  const msgs = await doc.getMessages({
    limit: 10,
    skip: 0,
  });
  expect(msgs[0].content).toEqual('Private msg 1');
});

test('mark all message read works correctly', async () => {
  const u1 = new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await u1.save();
  const u2 = new User({
    username: 'username2',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await u2.save();

  const { doc } = await Channel.findOrCreate({
    usernames: [u1.username, u2.username],
  });
  await doc.addMessage({
    content: 'Private msg 1',
    status: 'Ok',
    user: u1._id,
  });
  await doc.markAllMessagesRead({ user: u2._id });
  const count = await doc.getUnreadMessagesCount({ user: u2._id });
  expect(count).toEqual(0);
});

test('Find or create functionality', async () => {
  const user1 = await User.register({
    username: 'user1',
    password: '1234',
    confirmCreation: true,
  });
  try {
    await Channel.findOrCreate({
      usernames: [user1.username, 'random'],
    });
    expect(true).toEqual(false);
  } catch (e) {
    expect(e.status).toEqual(404);
    expect(e.error).toEqual('NotFoundError');
  }
});
