const jwt = require('jsonwebtoken');
const models = require('../models');

const jwtSecret = process.env.JWT_SECRET || 'secret';

module.exports = (req, res, next) => {
  const token = req.query.token || req.get('Authorization');
  jwt.verify(token, jwtSecret, (err, email) => {
    if (err) {
      next({code: 401, message: 'Unauthorized.'});
    } else {
      models.User.findOne({where: {email}})
      .then(user => {
        req.user = user;
        next();
      });
    }
  });
};
