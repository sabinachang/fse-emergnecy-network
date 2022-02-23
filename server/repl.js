const repl = require('repl');
require('./models/connection');
const User = require('./models/user');

const app = repl.start('> ');
app.context.User = User;
