const moment = require('moment');
const models = require('../dist/models');

const formatTime = time => {
  const str = String(time);
  return str.substr(0, 2) + ':' + str.substr(2);
};

(async () => {
  await models.sequelize.sync();
  const restaurants = await models.Restaurant.findAll();
  const from = moment().format('YYYY-MM-DD');
  for (const restaurant of restaurants) {
    const openingHours = [];
    if (restaurant.openingHours && restaurant.openingHours.length) {
      let dayOfWeek = 0;
      for (const hours of restaurant.openingHours) {
        if (hours) {
          const [opens, closes] = hours;
          openingHours.push({
            opens: formatTime(opens),
            closes: formatTime(closes),
            manualEntry: true,
            from,
            dayOfWeek,
            RestaurantId: restaurant.id
          });
        }
        dayOfWeek++;
      }
    }
    // console.log(openingHours);
    models.OpeningHour.bulkCreate(openingHours);
  }
})();
