const winston = require('winston');
const { levels, jsonFormat, textFormat } = require('../logger');

const textLogger = winston.createLogger({
  levels,
  level: 'debug',
  format: textFormat,
  transports: [new winston.transports.Console({ silent: true })],
});

const jsonLogger = winston.createLogger({
  levels,
  level: 'debug',
  format: jsonFormat,
  transports: [new winston.transports.Console({ silent: true })],
});

test('text logger works properly', () => {
  textLogger.info('hi');
});

test('text logger could log object', () => {
  textLogger.info({ key: 'value' });
});

test('text logger could log with message key object', () => {
  textLogger.info({ key: 'value', message: 'message' });
});

test('json logger works properly', () => {
  jsonLogger.info('hi');
});

test('json logger could log object', () => {
  jsonLogger.info({ key: 'value' });
});

test('json logger could log with message key object', () => {
  jsonLogger.info({ key: 'value', message: 'message' });
});

test('json logger protects user password', () => {
  jsonLogger.info({ key: 'value', password: 'message' });
});

test('json logger protects could handle buffer properly', () => {
  const buf = Buffer.from('hihi', 'utf8');
  jsonLogger.info({ key: 'value', message: 'message', buf });
});
