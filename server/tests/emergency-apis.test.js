const axios = require('axios');
const configureDatabase = require('../models/connection');
const Emergency = require('../models/emergency');
const fakeEmergencies = require('../models/tests/fixtures/emergencies');
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
  await Emergency.deleteMany();
});
afterAll(async () => {
  await connection.disconnect();
  await server.close();
});

test('Can create an emergency', async () => {
  const res = await request.post(
    `/api/emergencies`,
    {
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
      type: 'Bushfire',
      severity: 'Medium',
      peopleInjured: false,
    },
    {
      headers: { Cookie },
    },
  );

  expect(res.status).toBe(201);
  expect(res.data.emergency).toBeDefined();
});

const serializeParams = (params) => {
  return Object.entries(params)
    .reduce((str, [key, value]) => `${str}&${key}=${value}`, '')
    .slice(1);
};

test('Can get a list of emergencies', async () => {
  await Emergency.insertMany(fakeEmergencies);

  const params = {
    maxDistance: 10 * 1000,
    longitude: 149.1356,
    latitude: 35.2719,
  };
  const paramsStr = serializeParams(params);
  const res = await request.get(`/api/emergencies?${paramsStr}`, {
    headers: { Cookie },
  });

  expect(res.status).toBe(200);
  expect(res.data.data.length).toBe(1);
});
