const configureDatabase = require('../../models/connection');
const messageController = require('../messageController');
const User = require('../../models/user');
const Channel = require('../../models/channel');
const Message = require('../../models/message');

let connection;

const mockRequest = ({
  params,
  user = {},
  body = {},
  app = {},
  query = {},
}) => {
  const req = {
    params,
    user,
    body,
    app,
    query,
  };
  return req;
};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeAll(async () => {
  connection = await configureDatabase(
    global.__MONGO_URI__,
    global.__MONGO_DB_NAME__,
  );
});
beforeEach(async () => {
  await User.deleteMany();
  await Channel.deleteMany();
  await Message.deleteMany();
});
afterAll(async () => {
  await connection.disconnect();
});

test('can create message to announcement channel and broadcast update ', async () => {
  const req = mockRequest({
    user: {
      status: 'Ok',
      username: 'u1',
    },
    body: {
      content: 'Hello msg content',
      channel: 'announcement',
    },
    app: {
      io: {
        sockets: {
          emit: jest.fn(),
        },
      },
    },
  });
  const res = mockResponse();

  await messageController.createMessage(req, res, () => {});

  expect(req.app.io.sockets.emit).toHaveBeenCalledWith(
    'updateMessages',
    expect.anything(),
    { from: 'announcement', isPublic: true },
  );
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({
    content: 'Hello msg content',
    created_at: expect.anything(),
    help_types: expect.anything(),
    status: 'Ok',
    user: { username: 'u1' },
  });
});

test('can create message to public channel and broadcast update ', async () => {
  const req = mockRequest({
    user: {
      status: 'Ok',
      username: 'u1',
    },
    body: {
      content: 'Hello msg content',
      channel: 'public',
    },
    app: {
      io: {
        sockets: {
          emit: jest.fn(),
        },
      },
    },
  });
  const res = mockResponse();

  await messageController.createMessage(req, res, () => {});

  expect(req.app.io.sockets.emit).toHaveBeenCalledWith(
    'updateMessages',
    expect.anything(),
    { isPublic: true, from: 'public' },
  );
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({
    content: 'Hello msg content',
    created_at: expect.anything(),
    help_types: expect.anything(),
    status: 'Ok',
    user: { username: 'u1' },
  });
});

test('can create message to private channel and notify channel update', async () => {
  const u1 = new User({
    status: 'Ok',
    username: 'user1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });

  await u1.save();
  const u2 = new User({
    status: 'Ok',
    username: 'user2',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });
  await u2.save();

  const channel = await Channel.findOrCreate({
    usernames: ['user1', 'user2'],
  });
  const mockEmit = jest.fn();
  const req = mockRequest({
    user: u1,
    body: {
      content: 'Hello from u1',
      channel: channel.doc._id,
    },
    app: {
      io: {
        to: jest.fn().mockReturnValue({
          emit: mockEmit,
        }),
      },
    },
  });
  const res = mockResponse();

  await messageController.createMessage(req, res, () => {});

  expect(req.app.io.to).toHaveBeenCalledWith(u2._id);
  expect(mockEmit).toHaveBeenCalledWith('updateMessages', channel.doc._id, {
    isPublic: false,
    from: 'user1',
  });
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({
    content: 'Hello from u1',
    created_at: expect.anything(),
    help_types: expect.anything(),
    status: 'Ok',
    user: { username: 'user1' },
  });
});

test('can get message from specified channel', async () => {
  const u1 = new User({
    username: 'user1',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  });

  await u1.save();
  const m1 = {
    content: 'Message 1',
    status: 'Ok',
    user: u1._id,
  };

  const m2 = {
    content: 'Message 2',
    status: 'Ok',
    user: u1._id,
  };

  const announcementChannel = await Channel.fetch('announcement');
  await announcementChannel.addMessage(m1);
  await announcementChannel.addMessage(m2);

  const req = mockRequest({
    query: {
      channel: 'announcement',
    },
  });
  const res = mockResponse();
  await messageController.getMessages(req, res, () => {});
  expect(res.json).toHaveBeenCalledWith({
    total: 2,
    limitNumber: 20,
    current: 1,
    data: expect.anything(),
  });
});
