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
         res.json(restaurants.map(r => r.getPublicAttributes(req.lang)));
      });
   } else {
      res.status(400).json({message: 'invalid list of restaurant ids'});
   }
});
