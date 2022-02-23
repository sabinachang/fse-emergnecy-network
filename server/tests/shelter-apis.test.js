const axios = require('axios');
const configureDatabase = require('../models/connection');
const User = require('../models/user');
const io = require('../socket');
const fakeUsers = require('../models/tests/fixtures/users');
const jwtUtils = require('../utils/jwt');
const Shelter = require('../models/shelter');

const app = require('../app');

let server;
let connection;
let request;
beforeAll(async (done) => {
  connection = await configureDatabase(
    global.__MONGO_URI__,
    global.__MONGO_DB_NAME__,
  );
  app.io = io;
  server = app.listen(() => {
    const { port } = server.address();
    request = axios.create({
      baseURL: `http://localhost:${port}`,
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 500,
    });
    done();
  });
});
afterAll(async () => {
  await connection.disconnect();
  await server.close();
});

beforeEach(async () => {
  await Shelter.deleteMany();
});

test('Can create new shelter', async () => {
  await User.insertMany(fakeUsers);
  const res = await request.post(
    `/api/shelters`,
    {
      name: 'EC1',
      address: 'EC1ADDRESS',
      description: 'lorem',
      longitude: 0,
      latitude: 12,
    },
    {
      headers: {
        Cookie: `token=${jwtUtils.signJWT({ username: 'Tony' })}`,
      },
    },
  );
  expect(res.status).toBe(201);
});

test('Can get a list of shelters', async () => {
  await Shelter.create({
    name: 'EC2',
    address: 'lorem2',
    description: 'lorem3',
    location: {
      type: 'Point',
      coordinates: [0, 12],
    },
  });
  const res = await request.get(`/api/shelters`, {
    headers: {
      Cookie: `token=${jwtUtils.signJWT({ username: 'Tony' })}`,
    },
  });

  expect(res.status).toBe(200);
  expect(res.data.data.length).toBe(1);
});

test('Can checkin to a shelter', async () => {
  const shelter = await Shelter.create({
    name: 'EC2',
    address: 'lorem2',
    description: 'lorem3',
    location: {
      type: 'Point',
      coordinates: [0, 12],
    },
  });
  const res = await request.patch(
    `/api/users/Tony/shelter`,
    {
      id: shelter._id,
    },
    {
      headers: {
        Cookie: `token=${jwtUtils.signJWT({ username: 'Tony' })}`,
      },
    },
  );
  expect(res.status).toBe(200);
});

test('Can checkout from a shelter', async () => {
  await Shelter.create({
    name: 'EC2',
    address: 'lorem2',
    description: 'lorem3',
    location: {
      type: 'Point',
      coordinates: [0, 12],
    },
  });
  const res = await request.patch(
    `/api/users/Tony/shelter`,
    {
      id: null,
    },
    {
      headers: {
        Cookie: `token=${jwtUtils.signJWT({ username: 'Tony' })}`,
      },
    },
  );
  expect(res.status).toBe(200);
});
