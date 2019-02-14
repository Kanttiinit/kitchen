import { buildSchema } from 'graphql';

export default buildSchema(`
type Query {
  areas(lang: Lang!): [Area!]!
  restaurants(lang: Lang!): [Restaurant!]!
  area(id: ID!, lang: Lang!): Area
  restaurant(id: ID!, lang: Lang!): Restaurant
  restaurantsByLocation(latitude: Float!, longitude: Float!, lang: Lang!, distance: Int = 2000): [RestaurantWithDistance!]!
  restaurantsByQuery(query: String!, lang: Lang!): [Restaurant!]!
  favorites(lang: Lang!): [Favorite!]!
  updates: [Update!]!
}

enum Lang {
  fi
  en
}

# Represents a geolocial grouping of restaurants.
type Area {
  id: ID!
  name: String!
  restaurants: [Restaurant!]!
}

type Favorite {
  id: ID!
  name: String!
  regexp: String!
}

type RestaurantWithDistance {
  id: ID!
  name: String!
  area: Area!
  url: String!
  latitude: Float!
  longitude: Float!
  # The human-readable address of the restaurant.
  address: String
  # Weekly opening hours, first element in array is Monday.
  openingHours: [String]!
  menu(day: String): Menu
  distance: Float!
}

type Restaurant {
  id: ID!
  name: String!
  area: Area!
  url: String!
  latitude: Float!
  longitude: Float!
  # The human-readable address of the restaurant.
  address: String
  # Weekly opening hours, first element in array is Monday.
  openingHours: [String]!
  menu(day: String): Menu
}

type Menu {
  day: String!
  courses: [Course!]!
}

type Course {
  title: String!
  properties: [String!]!
}

type Update {
  id: ID!
  type: String
  title: String!
  description: String!
}

enum ChangeModel {
  Restaurant
}

type Change {
  uuid: ID!
  modelName: ChangeModel!
  modelFilter: String!
  change: String!
  appliedAt: String
}
`);
