import * as models from '../models';

export default async (req, res, next) => {
  if (req.session.user) {
    req.user = await models.User.findOne({where: {email: req.session.user}});
    next();
  } else {
    next({code: 401, message: 'Unauthorized.'});
  }
};
