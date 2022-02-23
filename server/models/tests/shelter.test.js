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

test('user init evacuation center is empty', async () => {
  const user = await User.register({
    username: 'john',
    password: 'pwd456',
    confirmCreation: false,
  });
  expect(user.shelter).toEqual(undefined);
});
