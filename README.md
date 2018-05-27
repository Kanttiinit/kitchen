# Kanttiinit Backend

Kitchen is the backend powering Kanttiinit. It's built with express and uses a Postgres database.

## Local Development

Run `npm install` to install dependencies.

See the table below and make sure that all required environment variables are available. Then run `npm start` to start the development server.

### Environment variables

| Key                        | Description                                                           | Required                                                          |
| -------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| AWS_ACCESS_KEY_ID          | AWS access key id for S3.                                             | If you want to use the endpoint that generates restaurant images. |
| AWS_SECRET_ACCESS_KEY      | AWS access key secret for S3.                                         | As above.                                                         |
| DATABASE_URL               | URI for the Postgres database.                                        | Yes.                                                              |
| GOOGLE_STATIC_MAPS_API_KEY | Google API key.                                                       | If you want to create or modify areas.                            |
| ORIGINS                    | Comma-separated list of origins that are allowed to do CORS requests. | If you want to make requests to the server from another domain.   |
| PORT                       | Port which the server will start listening.                           | No (defaults to 3000).                                            |
| SEQUELIZE_LOGGING          | If set, outputs SQL queries executed by Sequelize.                    | No (defaults to false).                                           |
| SESSION_SECRET             | Secret for hashing session ids (can be anything in development).      | Yes.                                                              |

### Testing menu parsers

To test a menu parser on a certain URL, run `babel-node src/parser 'http://restaurant.com/menu.json'`. `babel-node` is available if you have installed `babel-cli` globally.

### ESLint

This code base uses ESLint for linting JavaScript in order to keep the style uniform. ESLint has integrations for all major IDE's and we highly recommend installing it. We won't accept contributions that don't pass the linter rules!

## Testing

The test suite is still very incomplete and running it is cumbersome. All help is appreciated.

## Public Endpoints

### `/areas`

Returns array of [Area](/test/schema/area.json).

### `/restaurants?location=:latitude,:longitude`

Returns array of [Restaurant](/test/schema/restaurant.json) (without `menus` key).

If the optional `location` query parameter is provided, the restaurants will be sorted by distance from shortest to longest.

### `/menus/?restaurants=:restaurantIdList`

Returns [Menu Endpoint](/test/schema/menu-endpoint.json).

Returns menus specified by the supplied restaurant id's. The id's have to be separated by commas.

### `/favorites`

Returns array of [Favorite](/test/schema/favorite.json).

### `/restaurants/:restaurantId/menu?day=YYYY-MM-DD`

Returns [Restaurant](/test/schema/restaurant.json).
