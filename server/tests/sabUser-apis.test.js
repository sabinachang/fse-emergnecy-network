const axios = require('axios');
const configureDatabase = require('../models/connection');
const StatusHistory = require('../models/statusHistory');
const User = require('../models/user');
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

test('Can get qualification of a user', async () => {
  await User.create({
    username: 'John',
    password: '1234',
    sessionExpiresAt: Date.now(),
    qualifications: ['technician', 'rescuer'],
  });

  const res = await request.get(`/api/users/John/qualifications`, {
    headers: { Cookie },
  });
  expect(res.status).toBe(200);
  expect(res.data.qualifications).toEqual(
    expect.arrayContaining(['technician', 'rescuer']),
  );
});

test('Can update qualification of a user', async () => {
  await User.create({
    username: 'John',
    password: '1234',
    sessionExpiresAt: Date.now(),
  });

  const res = await request.post(
    `/api/users/John/qualifications`,
    { list: ['technician'] },
    {
      headers: { Cookie },
    },
  );

  expect(res.data.result).toEqual('ok');
});
