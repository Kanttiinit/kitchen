# Kanttiinit Backend

kanttiinit/kitchen is the backend service powering Kanttiinit.
It's built using Deno, Hono and Postgres.
Static data (areas, restaurant metadata and favorites) are stored in the repository itself, while menu and user change data is stored in Postgres.

## Local Development

Run `deno install` to install dependencies.
Start the local server by running `deno run dev`.

No environment variables are required to run the server with basic functionality.
Certain features might not work until the required variables are defined, though.
See all used environment variables in the `environment.ts` file.

If `DATABASE_URL` is not defined, a local file-backed PGlite instance will be used.

## Adding a restaurant

`data/restaurants.yml` contains a list of all restaurants.
Add a new restaurant by adding an item to the end of the list with the same schema as the rest.
Choose a new ID by incrementing the ID of the previous restaurant.

When running the server (either via `deno run dev` or `deno test --allow-all`), the data will be validated.

See "adding a menu parser" below if a parser for its menu format doesn't exist yet.

## Adding a menu parser

To add a new menu parser, add a file with the name of the parser to `src/menu-parser/parsers`.
The file should default export an object conforming to the `Parser` interface defined in `src/menu-parser/index.ts`.
Also add the parser to the list in `src/menu-parser/parsers/index.ts`.

To debug and test the parser, run `deno run test-menu-parser <menu url> <fi|en>`.
For example: `deno run test-menu-parser https://www.compass-group.fi/menuapi/feed/json\?costNumber\=0190\&language\=fi en`
