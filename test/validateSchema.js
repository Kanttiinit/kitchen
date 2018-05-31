const { Validator } = require('jsonschema');

const areaSchema = require('../schema/area.json');
const restaurantSchema = require('../schema/restaurant.json');
const favoriteSchema = require('../schema/favorite.json');
const menuSchema = require('../schema/menu.json');
const menuEndpointSchema = require('../schema/menu-endpoint.json');

const validator = new Validator();
validator.addSchema(areaSchema, 'area.json');
validator.addSchema(restaurantSchema, '/restaurant.json');
validator.addSchema(favoriteSchema, 'favorite.json');
validator.addSchema(menuEndpointSchema, 'menu-endpoint.json');
validator.addSchema(menuSchema, 'menu.json');

const createValidator = schema => (input, isList) => {
  let clonedSchema = { ...schema };
  if (isList) {
    clonedSchema = { type: 'array', items: clonedSchema };
  }
  const result = validator.validate(input, clonedSchema);

  if (result.valid) {
    return true;
  }

  let output = '';
  for (const error of result.errors) {
    output += error.message + '\n';
  }
  return output;
};

module.exports.validateRestaurant = createValidator(restaurantSchema);
module.exports.validateArea = createValidator(areaSchema);
module.exports.validateFavorite = createValidator(favoriteSchema);
module.exports.validateMenu = createValidator(menuSchema);
module.exports.validateMenuEndpoint = createValidator(menuEndpointSchema);
