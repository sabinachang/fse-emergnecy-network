const config = require('config');
const Youch = require('youch');
const handle500Error = require('../handle500Error');
const logger = require('../../utils/logger');

jest.mock('../../utils/logger', () => {
  return {
    error: jest.fn(),
  };
});

jest.mock('youch', () => {
  return jest.fn().mockImplementation(() => ({
    toHTML: () => Promise.resolve('hihi'),
  }));
});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn();
  return res;
};

afterEach(() => {
  config.env = 'test';
});

test('gives json response for 500 error without stack in non-dev env', () => {
  const err = new Error('boom');
  const req = {
    accepts: jest.fn().mockImplementation((format) => format === 'json'),
  };
  const next = jest.fn();
  const res = mockResponse();
  handle500Error()(err, req, res, next);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    message: 'boom',
  });
});

test('gives json response for 500 error with stack in development env', () => {
  config.env = 'development';
  const err = new Error('boom');
  const req = {
    accepts: jest.fn().mockImplementation((format) => format === 'json'),
  };
  const next = jest.fn();
  const res = mockResponse();
  handle500Error()(err, req, res, next);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    message: err.message,
    stack: err.stack,
  });
});

test('use a nice UI for error messages in development', async () => {
  config.env = 'development';
  const err = new Error('boom');
  const req = {
    accepts: jest.fn().mockImplementation((format) => format !== 'json'),
  };
  const next = jest.fn();
  const res = mockResponse();
  await handle500Error()(err, req, res, next);
  expect(Youch).toHaveBeenCalledWith(err, req);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith('hihi');
});

test('use default 500 handler for non development env for 500 errors', async () => {
  const err = new Error('boom');
  const req = {
    accepts: jest.fn().mockImplementation((format) => format !== 'json'),
  };
  const next = jest.fn();
  const res = mockResponse();
  handle500Error()(err, req, res, next);
  expect(logger.error).toHaveBeenCalledWith({
    message: err.message,
    stack: err.stack,
  });
  expect(next).toHaveBeenCalledWith(err);
});
