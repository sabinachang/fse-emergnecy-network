const configureDatabase = require('../connection');
const Message = require('../message');
const User = require('../user');
const Channel = require('../channel');
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

test('toJSON', async () => {
  const user = await User.create({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  const publicChannel = Channel.create({
    name: 'public',
  });
  const message = await Message.create({
    content: 'hihi',
    user: user._id,
    channel: publicChannel._id,
  });
  expect(message.toJSON()).toEqual({
    id: expect.any(String),
    created_at: expect.any(Date),
    updated_at: expect.any(Date),
    read_by_users: [],
    user: user._id,
    content: 'hihi',
    help_types: [],
  });
});

test('list only messages in public channel', async () => {
  const user = new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await user.save();
  const publicChannel = new Channel({
    name: 'public',
  });
  await publicChannel.save();
  await new Message({
    content: 'Message 1',
    status: 'Ok',
    user: user._id,
    channel: publicChannel._id,
  }).save();
  await new Message({
    content: 'Message 2',
    status: 'Ok',
    user: user._id,
    channel: new Channel({
      name: 'private',
    }),
  }).save();
  await new Message({
    content: 'Message 3',
    status: 'Ok',
    user: user._id,
    channel: publicChannel._id,
  }).save();

  const msgs = await Message.list({
    channel: publicChannel._id,
    limit: 10,
    skip: 0,
  });
  expect(msgs.length).toBe(2);
});

test('Can filter the message by search keyword', async () => {
  const user = new User({
    username: 'username1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await user.save();
  const publicChannel = new Channel({
    name: 'public',
  });
  const publicAnnoucement = new Channel({
    name: 'annoucement',
  });
  await publicChannel.save();
  await publicAnnoucement.save();
  await new Message({
    content: 'Orange Juice',
    status: 'Ok',
    user: user._id,
    channel: publicChannel._id,
  }).save();
  await new Message({
    content: 'Coffee and tea',
    status: 'Ok',
    user: user._id,
    channel: publicChannel._id,
  }).save();
  await new Message({
    content: 'coffee',
    status: 'Ok',
    user: user._id,
    channel: publicChannel._id,
  }).save();
  await new Message({
    content: 'coffee and 123',
    status: 'Ok',
    user: user._id,
    channel: publicAnnoucement._id,
  }).save();
  const msgs = await publicChannel.getMessages({
    limit: 10,
    skip: 0,
    search: 'coffee',
  });
  expect(msgs.length).toBe(2);
});

test('can serach by private channels', async () => {
  const user1 = await User.register({
    username: 'user1',
    password: '1234',
    confirmCreation: true,
  });
  const user2 = await User.register({
    username: 'user2',
    password: '1234',
    confirmCreation: true,
  });
  const channel = await Channel.create({
    name: 'public',
    users: [user1._id, user2._id],
  });
  await channel.addMessage({
    content: 'hi 1',
    status: 'Ok',
    user: user1._id,
  });
  await channel.addMessage({
    content: 'hi 2',
    status: 'Ok',
    user: user1._id,
  });
  // search by user 2
  const messages = await Message.list({
    search: 'hi',
    user: user2._id,
    limit: 20,
    skip: 0,
  });
  expect(messages.length).toEqual(2);
});
