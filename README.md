# Kanttiinit Backend

## Environment Variables for Local Development

| Key | Description |
| --- | ----------- |
| DATABASE_URL | URI for the Postgres database |
| PASSWORD | Hashed password for the admin interface |
| AWS_ACCESS_KEY_ID | AWS access key id for S3 |
| AWS_SECRET_ACCESS_KEY | AWS access key secret for S3 |

## Public Endpoints

### `/areas`

Returns array of [Area](/test/schema/area.json).

### `/restaurants?location=:latitude,:longitude`
Returns array of [Restaurant](/test/schema/restaurant.json).

If the optional `location` query parameter is provided, the restaurants will be sorted by distance from shortest to longest.

### `/menus/?restaurants=:restaurantIdList`
Returns [Menu Endpoint](/test/schema/menu-endpoint.json).

Returns menus specified by the supplied restaurant id's. The id's have to be separated by commas.

### `/favorites`
Returns array of [Favorite](/test/schema/favorite.json).

### `/restaurants/:restaurantId/menu?day=YYYY-MM-DD`
Returns [Restaurant](/test/schema/restaurant.json).

### `/restaurants/:restaurantId/menu.html?day=YYYY-MM-DD&width=:width`
Returns menus as a HTML page.

### `/restaurants/:restaurantId/menu.png?day=YYYY-MM-DD&width=:width`
Redirects to `/menu.html` rendered as a PNG that is hosted on Amazon AWS.
