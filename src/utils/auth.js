import models from '../models';

export default (req, res, next) => {
  if (req.session.user) {
    models.User.findOne({where: {email: req.session.user}})
    .then(user => {
      req.user = user;
      next();
    });
  } else {
    next({code: 401, message: 'Unauthorized.'});
  }
};
