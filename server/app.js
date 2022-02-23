const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const ejsLayout = require('express-ejs-layouts');
const jwt = require('express-jwt');
const config = require('config');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const morgan = require('morgan');

const logger = require('./utils/logger');
const handle500Error = require('./middlewares/handle500Error');
const handleJWTTokenError = require('./middlewares/handleJWTTokenError');
const handle4xxError = require('./middlewares/handle4xxError');
const pages = require('./routers/pages');
const apis = require('./routers/apis');
const jwtUtils = require('./utils/jwt');

const swaggerDocument = YAML.load(path.resolve(__dirname, '../docs/api.yml'));

const app = express()
  .set('view engine', 'ejs')
  .set('views', path.resolve(__dirname, './views'))
  .use(ejsLayout) // By default 'views/layout.ejs' is used
  .set('layout extractScripts', true)
  .use(
    morgan('dev', {
      stream: {
        write(msg) {
          logger.debug(msg.trim());
        },
      },
    }),
  )
  .use(
    jwt({
      secret: config.jwt.secret,
      algorithms: config.jwt.algorithms,
      credentialsRequired: false,
      getToken: jwtUtils.getJwtToken,
    }),
  )
  .use('/', express.static(path.resolve(__dirname, '../dist')))
  .use(bodyParser.json())
  .use(pages)
  .use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
    }),
  )
  .use('/api', apis)
  .use((req, res, next) => {
    const e = new Error(`The route ${req.path} is not declared`);
    e.error = 'NotFoundError';
    e.status = 404;
    next(e);
  })
  .use(handleJWTTokenError())
  .use(handle4xxError())
  .use(handle500Error());

module.exports = app;
