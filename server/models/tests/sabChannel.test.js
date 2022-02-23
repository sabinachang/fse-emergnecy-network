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

test('can store message with one help to public channel', async () => {
  const u1 = new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await u1.save();

  const channel = await Channel.fetch('public');
  const helpTypes = ['healthcare worker'];
  await channel.addMessage({
    content: 'My friend is hurt, I need healthcare worker',
    status: 'Help',
    user: u1._id,
    helpTypes,
  });
  const msgs = await channel.getMessages({
    limit: 10,
    skip: 0,
  });

  expect(msgs[0].help_types).toEqual(expect.arrayContaining(helpTypes));
});

test('can store message with multiple help and no help to public channel', async () => {
  const u1 = new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await u1.save();

  const channel = await Channel.fetch('public');
  const helpTypes = ['healthcare worker', 'machinery operator', 'firefighter'];
  await channel.addMessage({
    content: 'Can someone help ',
    status: 'Emergency',
    user: u1._id,
    helpTypes,
  });

  await channel.addMessage({
    content: 'I am fine ',
    status: 'Ok',
    user: u1._id,
  });
  const msgs = await channel.getMessages({
    limit: 10,
    skip: 0,
  });
  expect(msgs[0].help_types).toEqual([]);
  expect(msgs[1].help_types).toEqual(expect.arrayContaining(helpTypes));
});
