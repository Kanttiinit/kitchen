# Kanttiinit Backend

Kitchen is the backend powering Kanttiinit. It's built with Express and uses a Postgres database.

## Local Development

Run `yarn install` to install dependencies.

See the table below and make sure that all required environment variables are available. Then run `yarn develop` to start the development server.

Use `docker compose up db` to run a local database. This will run an host a database in `postgresql://postgres:postgres@localhost:5432/kitchen_test`


### Environment variables

This project uses [dotenv](https://github.com/motdotla/dotenv), which means that you can just place the environment variables in a `.env` file at the root of the project.

| Key               | Description                                                           | Required                                                        |
| ----------------- | --------------------------------------------------------------------- | --------------------------------------------------------------- |
| DATABASE_URL      | URI for the Postgres database.                                        | Yes.                                                            |
| ORIGINS           | Comma-separated list of origins that are allowed to do CORS requests. | If you want to make requests to the server from another domain. |
| PORT              | Port which the server will start listening.                           | No (defaults to 3000).                                          |
| SEQUELIZE_LOGGING | If set, outputs SQL queries executed by Sequelize.                    | No (defaults to false).                                         |
| SESSION_SECRET    | Secret for hashing session ids (can be anything in development).      | Yes.                                                            |

### Testing menu parsers

To test the menu parser on a certain URL, run `node dist/menu-parser "http://restaurant.com/menu.json"`.

### ESLint

This code base uses ESLint for linting JavaScript in order to keep the style uniform. ESLint has integrations for all major IDE's and we highly recommend installing it. We won't accept contributions that don't pass the linter rules!
