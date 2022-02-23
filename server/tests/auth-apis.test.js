const axios = require('axios');
const configureDatabase = require('../models/connection');
const io = require('../socket');
const jwtUtils = require('../utils/jwt');

const EXPIRED_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhhbnMiLCJpYXQiOjE2MDQ0NzIxNTgsImV4cCI6MTYwNDQ3MjIxOH0.IundocaqpxxRsNK9ODe4oT8ssInFlH13aFTjlYRZOTI';

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

test('will land on "/" route(join community) when not logged in', async () => {
  const res = await request.get('/', {
    headers: {
      accept: 'text/html',
    },
  });
  expect(res.status).toBe(200);
});

test('Can register user', async () => {
  const res = await request.post(`/api/authorizations`, {
    username: 'Tony',
    password: 'pwd123',
    confirm_creation: true,
  });
  expect(res.status).toBe(200);
});

test('Can login user', async () => {
  const res = await request.post(`/api/authorizations`, {
    username: 'Tony',
    password: 'pwd123',
    confirm_creation: false,
  });

  expect(res.status).toBe(200);
});

test('will land on "/emergencies" page when user logged in', async () => {
  const res = await request.get(`/`, {
    headers: {
      accept: 'text/html',
      Cookie: `token=${jwtUtils.signJWT({ username: 'Tony' })}`,
    },
  });
  expect(res.status).toBe(302);
  expect(res.headers.location).toBe('/emergencies');
});

test('can optionally use Bearer header for jwt', async () => {
  const res = await request.get('/api/users', {
    headers: {
      authorization: `Bearer ${jwtUtils.signJWT({ username: 'Tony' })}`,
    },
  });
  expect(res.status).toBe(200);
});

test('Can logout user', async () => {
  const res = await request.get(`/logout`, {
    headers: {
      accept: 'text/html',
      Cookie: `token=${jwtUtils.signJWT({ username: 'Tony' })}`,
    },
  });

  expect(res.status).toBe(302);
  expect(res.headers.location).toBe('/');
  expect(res.headers['set-cookie']).toEqual(
    expect.arrayContaining([expect.stringMatching(/token=;/)]),
  );
});

test('Can logout user even there is no user', async () => {
  const res = await request.get(`/logout`, {
    headers: {
      accept: 'text/html',
    },
  });

  expect(res.status).toBe(302);
  expect(res.headers.location).toBe('/');
});

test('Calling endpoint that requires logged in', async () => {
  const res = await request.get('/api/users');
  expect(res.status).toBe(401);
  expect(res.data).toEqual({
    error: 'AuthenticationError',
    message: 'User should login to perform this operation',
  });
});

test('Expired jwt handling (json api)', async () => {
  const res = await request.get('/api/users', {
    headers: {
      Cookie: `token=${EXPIRED_JWT}`,
    },
  });
  expect(res.status).toBe(401);
  expect(res.data).toEqual({
    error: 'AuthenticationError',
    message: 'User should login to perform this operation',
  });
});

test('Expired jwt handling (html)', async () => {
  const res = await request.get('/', {
    headers: {
      Accept: 'text/html',
      Cookie: `token=${EXPIRED_JWT}`,
    },
  });
  expect(res.status).toBe(302);
  expect(res.headers.location).toBe('/logout');
});
