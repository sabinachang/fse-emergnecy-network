const configureDatabase = require('../connection');
const User = require('../user');

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

test('Could add qualifications to user', async () => {
  const user = await User.create({
    username: 'John',
    password: '1234',
    sessionExpiresAt: Date.now(),
  });

  const list = ['first aid responder', 'technician'];
  await user.updateQualifications(['technician']);

  const match = await User.listMatch(list);
  expect(match.length).toEqual(1);
});

test('Return empty when no user have matching qualification', async () => {
  await User.create({
    username: 'John',
    password: '1234',
    sessionExpiresAt: Date.now(),
  });

  const list = ['first aid responder', 'technician'];

  const match = await User.listMatch(list);
  expect(match.length).toEqual(0);
});
