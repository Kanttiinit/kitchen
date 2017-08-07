import * as Sequelize from 'sequelize';
import * as models from '../models';

function formatIds(idString) {
  return idString && idString.split(',').filter(id => !isNaN(id)).map(id => +id);
}

export default async (req, res) => {
  const restaurantIds = formatIds(req.query.restaurants);
  const areaIds = formatIds(req.query.areas);

  let where = {};
  if (restaurantIds) {
    where['id'] = {$in: restaurantIds};
  } else if (areaIds) {
    where['AreaId'] = {$in: areaIds};
  }

  const restaurants = await models.Restaurant.findAll({
    where,
    include: [
      {
        required: false,
        model: models.Menu,
        where: {
          day: {$gte: Sequelize.fn('date_trunc', 'day', Sequelize.fn('now'))}
        }
      }
    ],
    order: Sequelize.col('day')
  });

  const response = restaurants.reduce((carry, restaurant) => {
    carry[restaurant.id] = restaurant.Menus.reduce((carry, menu) => {
      const fields = menu.getPublicAttributes(req.lang);
      carry[fields.day] = fields.courses;
      return carry;
    }, {});
    return carry;
  }, {});
  res.json(response);
};
