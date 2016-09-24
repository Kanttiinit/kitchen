import jwt from 'jsonwebtoken';
import models from '../models';

const jwtSecret = process.env.JWT_SECRET || 'secret';

export default (req, res, next) => {
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
