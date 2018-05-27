import * as moment from 'moment';

import * as models from '../models';

export default async (req, res, next) => {
  const { restaurantId } = req.params;

  const day = moment(req.query.day).format('YYYY-MM-DD');

  const restaurant = await models.Restaurant.findOne({
    where: { id: restaurantId },
    include: [
      {
        model: models.Menu,
        required: false,
        where: { day }
      }
    ]
  });

  if (!restaurant) {
    next({ code: 404, message: 'Not found.' });
  } else {
    res.json(restaurant.getPublicAttributes(req.lang));
  }
};
