const path = require('path');
const raw = require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
});

module.exports = raw.parsed;
