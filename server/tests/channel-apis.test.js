const axios = require('axios');
const configureDatabase = require('../models/connection');
const Channel = require('../models/channel');
const User = require('../models/user');
const fakeUsers = require('../models/tests/fixtures/users');
const jwtUtils = require('../utils/jwt');
const io = require('../socket');

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
  app.io = io;
});
beforeEach(async () => {
  await User.deleteMany();
  await Channel.deleteMany();
});
afterAll(async () => {
  await connection.disconnect();
  await server.close();
});

test('Can create a private channel and go to the page', async () => {
  await User.insertMany(fakeUsers);
  const res = await request.post(
    `/api/channels`,
    {
      usernames: ['Tony'],
    },
    {
      headers: { Cookie },
    },
  );
  expect(res.status).toBe(201);
  expect(res.data.users.length).toBe(2);
  const page = await request.get(`/channels/${res.data.id}`, {
    headers: {
      accept: 'text/html',
      Cookie,
    },
  });
  expect(page.status).toEqual(200);
});

test('Can retrieve an existing private channel', async () => {
  await User.insertMany(fakeUsers);
  const firstRes = await request.post(
    `/api/channels`,
    {
      usernames: ['Tony'],
    },
    {
      headers: { Cookie },
    },
  );

  const secondRes = await request.post(
    `/api/channels`,
    {
      usernames: ['Tony'],
    },
    {
      headers: { Cookie },
    },
  );
  expect(secondRes.status).toBe(200);
  expect(secondRes.data.id).toEqual(firstRes.data.id);
});

test('Can list all created private channels', async () => {
  await User.insertMany(fakeUsers);
  await request.post(
    `/api/channels`,
    {
      usernames: ['Tony'],
    },
    {
      headers: { Cookie },
    },
  );
  await request.post(
    `/api/channels`,
    {
      usernames: ['John'],
    },
    {
      headers: { Cookie },
    },
  );
  await request.post(
    `/api/channels`,
    {
      usernames: ['Jessica'],
    },
    {
      headers: { Cookie },
    },
  );

  const res = await request.get(`/api/channels/private`, {
    headers: { Cookie },
  });

  expect(res.data.total).toBe(3);
  expect(res.data.data.length).toBe(3);
});

test('Can post messages to private channel', async () => {
  await User.insertMany(fakeUsers);
  const { data } = await request.post(
    `/api/channels`,
    {
      usernames: ['Tony'],
    },
    {
      headers: { Cookie },
    },
  );
  const res = await request.post(
    `/api/messages`,
    {
      channel: data.id,
      content: 'test string',
    },
    {
      headers: { Cookie },
    },
  );
  expect(res.status).toBe(201);
  expect(res.data.content).toEqual('test string');
});

test('Can get messages from private channel', async () => {
  await User.insertMany(fakeUsers);
  const { data } = await request.post(
    `/api/channels`,
    {
      usernames: ['Tony'],
    },
    {
      headers: { Cookie },
    },
  );
  await request.post(
    '/api/messages',
    {
      channel: data.id,
      content: 'Hi how are you',
    },
    {
      headers: { Cookie },
    },
  );
  const res = await request.get(`/api/messages`, {
    params: {
      channel: data.id,
    },
    headers: { Cookie },
  });
  expect(res.data.total).toBe(1);
  expect(res.data.data[0].content).toEqual('Hi how are you');
});

test('Can list all public channels', async () => {
  await User.insertMany(fakeUsers);
  const channel = new Channel({ name: 'public' });
  channel.save();

  const res = await request.get(`/api/channels/public`, {
    headers: { Cookie },
  });

  expect(res.data.data.length).toBe(1);
});

test('Can post messages to public channel', async () => {
  await User.insertMany(fakeUsers);
  const res = await request.post(
    `/api/messages`,
    {
      channel: 'public',
      content: 'test string',
    },
    {
      headers: { Cookie },
    },
  );
  expect(res.status).toBe(201);
  expect(res.data.content).toEqual('test string');
});

test('Can get messages from announcement channel', async () => {
  await User.insertMany(fakeUsers);
  await request.post(
    `/api/messages`,
    {
      channel: 'public',
      content: 'Hi how are you',
    },
    {
      headers: { Cookie },
    },
  );
  const res = await request.get(`/api/messages`, {
    params: {
      channel: 'public',
    },
    headers: { Cookie },
  });
  expect(res.data.total).toBe(1);
  expect(res.data.data[0].content).toEqual('Hi how are you');
});

test('Can post messages to announcemnt channel as administrator', async () => {
  await User.insertMany(fakeUsers);
  const res = await request.post(
    `/api/messages`,
    {
      channel: 'announcement',
      content: 'test string',
    },
    {
      headers: { Cookie },
    },
  );
  expect(res.status).toBe(201);
  expect(res.data.content).toEqual('test string');
});

test('Can post messages to announcemnt channel as coordinator', async () => {
  await User.insertMany(fakeUsers);
  const CookieCoordinator = `token=${jwtUtils.signJWT({
    username: 'coordinatorA',
  })}`;

  const res = await request.post(
    `/api/messages`,
    {
      channel: 'announcement',
      content: 'test string',
    },
    {
      headers: { Cookie: CookieCoordinator },
    },
  );
  expect(res.status).toBe(201);
  expect(res.data.content).toEqual('test string');
});

test('Cannot post messages to announcemnt channel as citizen', async () => {
  await User.insertMany(fakeUsers);
  const CookieCitizen = `token=${jwtUtils.signJWT({ username: 'citizenA' })}`;

  try {
    await request.post(
      `/api/messages`,
      {
        channel: 'announcement',
        content: 'test string',
      },
      {
        headers: { Cookie: CookieCitizen },
      },
    );
    expect(true).toBe(false);
  } catch (err) {
    expect(err.response.data.message).toBe(
      'Only coordinator or administrator can make annoucements',
    );
  }
});

test('Can get peerUser status history in private channel', async () => {
  await User.insertMany(fakeUsers);
  const res1 = await request.post(
    `/api/channels`,
    {
      usernames: ['Tony'],
    },
    {
      headers: { Cookie },
    },
  );
  await request.patch(
    `/api/users/Tony/status`,
    {
      status: 'Emergency',
    },
    {
      headers: { Cookie },
    },
  );
  await request.patch(
    `/api/users/Tony/status`,
    {
      status: 'Help',
    },
    {
      headers: { Cookie },
    },
  );

  const res = await request.get(
    `/api/channels/statushistories?channel=${res1.data.id}`,
    {
      headers: { Cookie },
    },
  );
  expect(res.data.data.length).toBe(2);
});

test('Can read all messages in private channel', async () => {
  await User.insertMany(fakeUsers);
  const { data } = await request.post(
    `/api/channels`,
    {
      usernames: ['Tony'],
    },
    {
      headers: { Cookie },
    },
  );
  await request.post(
    `/api/messages`,
    {
      channel: data.id,
      content: 'test string',
    },
    {
      headers: { Cookie },
    },
  );

  const res = await request.patch(
    `/api/channels/${data.id}`,
    {
      mark_all_messages_read: true,
    },
    {
      headers: { Cookie },
    },
  );
  expect(res.data.unread_messages_count).toBe(0);
});

test('Can search messages with stop words in public channel', async () => {
  await User.insertMany(fakeUsers);
  await request.post(
    `/api/messages`,
    {
      channel: 'public',
      content: 'able banana dolla',
    },
    {
      headers: { Cookie },
    },
  );
  const res = await request.get(`/api/messages`, {
    params: {
      channel: 'public',
      search: 'able banana dolla',
    },
    headers: { Cookie },
  });
  expect(res.data.total).toBe(1);
});

test('Search messages with only stop words returns nothing', async () => {
  await User.insertMany(fakeUsers);
  await request.post(
    `/api/messages`,
    {
      channel: 'public',
      content: 'able where while',
    },
    {
      headers: { Cookie },
    },
  );
  const res = await request.get(`/api/messages`, {
    params: {
      channel: 'public',
      search: 'able where while',
    },
    headers: { Cookie },
  });
  expect(res.data.total).toBe(0);
});
