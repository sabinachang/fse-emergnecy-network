const axios = require('axios');
const configureDatabase = require('../models/connection');
const io = require('../socket');

// Initiate Server
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

test('it handles 404 page correctly (json)', async () => {
  const res = await request.get('/api/non-exisiting-page');
  expect(res.status).toEqual(404);
  expect(res.data).toEqual({
    error: 'NotFoundError',
    message: 'The route /api/non-exisiting-page is not declared',
  });
});

test('it handles 404 page correctly (html)', async () => {
  const res = await request.get('/non-exisiting-page', {
    headers: {
      accept: 'text/html',
    },
  });
  expect(res.status).toEqual(404);
});
