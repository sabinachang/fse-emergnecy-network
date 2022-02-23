const fakeUsers = [
  {
    username: 'John',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
    status: 'Ok',
  },
  {
    username: 'John2',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  },
  {
    username: 'Tony',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
    status: 'Help',
  },
  {
    username: 'Jessica',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
    status: 'Emergency',
  },
  {
    username: 'Eric',
    password: 'pwd123',
    sessionExpiresAt: Date.now(),
  },
  {
    username: 'myUser',
    role: 'administrator',
    password: 'pwd123',
    sessionExpiresAt: Date.now() + 2 * 60 * 60 * 1000,
  },
  {
    username: 'coordinatorA',
    role: 'coordinator',
    password: 'pwd123',
    sessionExpiresAt: Date.now() + 2 * 60 * 60 * 1000,
  },
  {
    username: 'citizenA',
    role: 'citizen',
    password: 'pwd123',
    sessionExpiresAt: Date.now() + 2 * 60 * 60 * 1000,
  },
];

module.exports = fakeUsers;
