import { buildSchema } from 'graphql';

export default buildSchema(`
type Query {
  areas(lang: Lang!): [Area!]!
  restaurants(lang: Lang!): [Restaurant!]!
  area(id: Int!, lang: Lang!): Area
  restaurant(id: Int!, lang: Lang!): Restaurant
  restaurantsByLocation(latitude: Float!, longitude: Float!, lang: Lang!, distance: Int = 2000): [Restaurant!]!
  restaurantsByQuery(query: String!, lang: Lang!): [Restaurant!]!
  favorites(lang: Lang!): [Favorite!]!
  updates: [Update!]!
}

enum Lang {
  fi
  en
}

type Area {
  id: Int!
  name: String!
  restaurants: [Restaurant!]!
}

type Favorite {
  id: Int!
  name: String!
  regexp: String!
}

type Restaurant {
  id: Int!
  distance: Float
  name: String!
  area: Area!
  url: String!
  latitude: Float!
  longitude: Float!
  address: String
  menus(day: String): [Menu!]!
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
  id: Int!
  type: String
  title: String!
  description: String!
}

enum ChangeModel {
  Restaurant
}

type Change {
  uuid: String!
  modelName: ChangeModel!
  modelFilter: String!
  change: String!
  appliedAt: String
}
`);
