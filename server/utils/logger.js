const _ = require('lodash');
const config = require('config');
const winston = require('winston');
const stringify = require('fast-safe-stringify');

// reference to google cloud logging levels
// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
const levels = {
  emergency: 0,
  alert: 1,
  critical: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7,
};

const colors = {
  emergency: 'red',
  alert: 'red',
  critical: 'red',
  error: 'red',
  warning: 'yellow',
  notice: 'blue',
  info: 'cyan',
  debug: 'magenta',
};

// the `info` is actually an instance, so can't use `Object.assign`....
// must reassign the function params if need to use winstonjs
/* eslint no-param-reassign: 0 */
if (config.env === 'development') {
  winston.addColors(colors);
}

const isBuffer = (buf) => {
  return (
    Buffer.isBuffer(buf) || (typeof buf === 'object' && buf.type === 'Buffer')
  );
};
const textFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format((info) => {
    info.severity = info.level.toUpperCase();
    delete info.level;
    return info;
  })(),
  winston.format.printf((info) => {
    const finalInfo = _.omit(info, 'message', 'severity');
    const json = stringify(finalInfo, null, 2);
    let result = `[${info.severity.toLowerCase()}]: ${
      typeof info.message === 'object'
        ? stringify(info.message, null, 2)
        : info.message
    }`;
    if (Object.keys(finalInfo).length !== 0) {
      result += `\n${json}`;
    }
    return result;
  }),
);
const jsonFormat = winston.format.combine(
  winston.format((info) => {
    info.severity = info.level.toUpperCase();
    delete info.level;
    if (typeof info.message === 'object') {
      Object.assign(info, info.message);
    }
    return info;
  })(),
  winston.format.json({
    replacer: (key, value) => {
      if (key === 'password') return '***';
      return isBuffer(value) ? '[buffer]' : value;
    },
  }),
);

const logger = winston.createLogger({
  levels,
  level: config.logLevel,
  format: config.env === 'development' ? textFormat : jsonFormat,
  transports: [new winston.transports.Console()],
});

logger.info(`[LOG_LEVEL]: ${config.logLevel}`);

module.exports = logger;
module.exports.levels = levels;
module.exports.jsonFormat = jsonFormat;
module.exports.textFormat = textFormat;
