import * as graphqlHTTP from 'express-graphql';
import { Area, Restaurant, Favorite } from '../../models';
import {
  getRestaurantsByLocation,
  getRestaurantsByQuery
} from '../public/getRestaurants';
import { GraphQLArea, GraphQLRestaurant } from './models';
import schema from './schema';

const rootValue = {
  async areas({ lang }) {
    const areas = await Area.findAll({ where: { hidden: false } });
    return areas.map(area => new GraphQLArea(area, lang));
  },
  async restaurants({ lang }) {
    const restaurants = await Restaurant.findAll({ where: { hidden: false } });
    return restaurants.map(
      restaurant => new GraphQLRestaurant(restaurant, lang)
    );
  },
  async area({ id, lang }) {
    const area = await Area.findByPk(id);
    if (area) {
      return new GraphQLArea(area, lang);
    }
    return null;
  },
  async restaurant({ id, lang }) {
    const area = await Restaurant.findByPk(id);
    if (area) {
      return new GraphQLRestaurant(area, lang);
    }
    return null;
  },
  async restaurantsByLocation({ latitude, longitude, distance, lang }) {
    const restaurants = await getRestaurantsByLocation(
      latitude,
      longitude,
      distance
    );
    return restaurants.map(
      restaurant => new GraphQLRestaurant(restaurant, lang)
    );
  },
  async restaurantsByQuery({ query, lang }) {
    const restaurants = await getRestaurantsByQuery(query);
    return restaurants.map(
      restaurant => new GraphQLRestaurant(restaurant, lang)
    );
  },
  async favorites({ lang }) {
    const favorites = await Favorite.findAll();
    return favorites.map(f => ({
      id: f.id,
      name: f.name_i18n[lang] || f.name_i18n.fi,
      regexp: f.regexp
    }));
  }
};

export default graphqlHTTP({
  schema,
  rootValue,
  graphiql: true
});
