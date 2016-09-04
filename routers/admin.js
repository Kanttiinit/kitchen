const express = require('express');
const utils = require('./utils');

module.exports = express.Router()
.use(utils.auth)
.use(express.static('admin'));
