const configureDatabase = require('../connection');
const User = require('../user');
const Channel = require('../channel');
const MatchingPost = require('../matchingPost');
require('../message');

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

test('can list matching post for a user', async () => {
  const u1 = new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await u1.save();
  const john = await User.create({
    username: 'John',
    password: '1234',
    sessionExpiresAt: Date.now(),
  });

  await john.updateQualifications(['technician']);

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
  const list = await MatchingPost.list({
    userId: john._id,
  });

  expect(list.length).toEqual(1);
});

test('can create matching post from message', async () => {
  const u1 = new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await u1.save();

  const channel = await Channel.fetch('public');
  const helpTypes = ['healthcare worker'];
  const msg = await channel.addMessage({
    content: 'My friend is hurt, I need healthcare worker',
    status: 'Help',
    user: u1._id,
    helpTypes,
  });

  const john = await User.create({
    username: 'John',
    password: '1234',
    sessionExpiresAt: Date.now(),
  });

  await john.updateQualifications(['technician']);

  const rose = await User.create({
    username: 'Rose',
    password: '1234',
    sessionExpiresAt: Date.now(),
  });

  await rose.updateQualifications(['healthcare worker']);

  const tom = await User.create({
    username: 'tom',
    password: '1234',
    sessionExpiresAt: Date.now(),
  });

  await tom.updateQualifications(['healthcare worker']);

  const post = await MatchingPost.createMatchingPost(msg);
  const expected = [rose._id, tom._id];

  expect(post.match_users).toEqual(expect.arrayContaining(expected));
});

test('can correctly record read/unread posts count', async () => {
  const u1 = new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await u1.save();
  const john = await User.create({
    username: 'John',
    password: '1234',
    sessionExpiresAt: Date.now(),
  });

  await john.updateQualifications(['technician']);

  const channel = await Channel.fetch('public');
  await channel.addMessage({
    content: 'test',
    status: 'Help',
    user: u1._id,
    helpTypes: ['healthcare worker', 'technician', 'firefighter'],
  });
  await channel.addMessage({
    content: 'test 2',
    status: 'Emergency',
    user: u1._id,
    helpTypes: ['technician'],
  });

  const unread = await MatchingPost.getUnreadMatchCount({
    user: john._id,
  });

  await MatchingPost.markAllMatchRead({
    user: john._id,
  });

  const noUnread = await MatchingPost.getUnreadMatchCount({
    user: john._id,
  });

  expect(unread).toEqual(2);
  expect(noUnread).toEqual(0);
});

test('will not create match post if no user matches', async () => {
  const u1 = new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await u1.save();
  const channel = await Channel.fetch('public');
  const msg = await channel.addMessage({
    content: 'test',
    status: 'Help',
    user: u1._id,
    helpTypes: ['healthcare worker', 'technician', 'firefighter'],
  });

  const match = await MatchingPost.createMatchingPost(msg);

  expect(match).toBeNull();
});

test('will not create match post if no help', async () => {
  const u1 = new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await u1.save();
  const channel = await Channel.fetch('public');
  const msg = await channel.addMessage({
    content: 'test',
    status: 'Help',
    user: u1._id,
  });

  const match = await MatchingPost.createMatchingPost(msg);

  expect(match).toBeNull();
});
