const configureDatabase = require('../connection');
const Emergency = require('../emergency');
const fakeEmergencies = require('./fixtures/emergencies');

let connection;
beforeAll(async () => {
  connection = await configureDatabase(
    global.__MONGO_URI__,
    global.__MONGO_DB_NAME__,
  );
});

beforeEach(async () => {
  await Emergency.deleteMany();
});
afterAll(async () => {
  await connection.disconnect();
});

test('list works with geolocation distances', async () => {
  await Emergency.insertMany(fakeEmergencies);

  const nearEmergencies = await Emergency.list({
    maxDistance: 10 * 1000,
    // Distance to Canberra 1km,
    // Distance to Sydney 200+km,
    longitude: 149.1356,
    latitude: 35.2719,
    limit: 10,
    skip: 0,
  });
  expect(nearEmergencies.length).toBe(1);
});

test('list gets 0 results if there is no emergencies createed after that date', async () => {
  await Emergency.insertMany(fakeEmergencies);

  const nearEmergencies = await Emergency.list({
    afterDate: new Date(),
    maxDistance: 1000 * 1000,
    // Distance to Canberra 1km,
    // Distance to Sydney 200+km,
    longitude: 149.1356,
    latitude: 35.2719,
    limit: 10,
    skip: 0,
  });
  expect(nearEmergencies.length).toBe(0);
});

test('list gets appropriate number of results with after date', async () => {
  await Emergency.insertMany(fakeEmergencies);

  const nearEmergencies = await Emergency.list({
    afterDate: new Date(Date.now() - 1000 * 60),
    maxDistance: 1000 * 1000,
    // Distance to Canberra 1km,
    // Distance to Sydney 200+km,
    longitude: 149.1356,
    latitude: 35.2719,
    limit: 10,
    skip: 0,
  });
  expect(nearEmergencies.length).toBe(2);
});
