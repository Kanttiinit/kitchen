const express = require('express');
const sequelize = require('sequelize');

const models = require('../models');

module.exports = express.Router()
.get('/menus/:restaurantIds', (req, res) => {
   const ids = req.params.restaurantIds.split(',');
   if (ids.every(n => !isNaN(n))) {
      models.Restaurant.findAll({
         where: {
            id: {$in: ids.map(n => +n)}
         },
         include: [
            {
               required: false,
               model: models.Menu,
               where: {
                  day: {$gte: sequelize.fn('date_trunc', 'day', sequelize.fn('now'))}
               }
            }
         ],
         order: sequelize.col('day')
      })
      .then(restaurants => {
         const response = restaurants.reduce((carry, restaurant) => {
            carry[restaurant.id] = restaurant.Menus.reduce((carry, menu) => {
               const fields = menu.getPublicAttributes(req.lang);
               carry[fields.day] = fields.courses;
               return carry;
            }, {});
            return carry;
         }, {});
         res.json(response);
      });
   } else {
      res.status(400).json({message: 'invalid list of restaurant ids'});
   }
});
