import * as models from '../models';

export default async (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    next({code: 401, message: 'Unauthorized.'});
  }
};
