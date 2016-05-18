# Kanttiinit Backend

## Environment Variables for Local Deployment

| Key | Description |
| --- | ----------- |
| DATABASE_URL | URI for the Postgres database |
| PASSWORD | Hashed password for the admin interface |
| AWS_ACCESS_KEY_ID | AWS access key id for S3 |
| AWS_SECRET_ACCESS_KEY | AWS access key secret for S3 |

## Object Schemas
### Area
```js
{
   "id": 1,
   "name": "Area",
   "latitude": 60.123456,
   "longitude": 24.123456,
   "locationRadius": 2,
   "Restaurants": [Restaurant]
}
```

### Menu
```js
{
   "day": "2016-12-31",
   "courses": [
      {
         "title": "Course title",
         "properties": ["A", "B", "C"]
      }
   ]
}
```

### Restaurant
```js
{
   "id": 1,
   "name": "Restaurant",
   "url": "https://restaurant.fi/",
   "formattedOpeningHours": {
      "mo": "11:00 - 15:00",
      "tu": "11:00 - 15:00",
      "we": "11:00 - 15:00",
      "th": "11:00 - 15:00",
      "fr": "11:00 - 15:00",
      "sa": "closed",
      "su": "closed"
   },
   "latitude": 60.123456,
   "longitude": 24.123456,
   "address": "Streetname 1, 01234 City",
   "Menus": [Menu]
}
```

## Public Endpoints

### `/areas`

Return format: `[Area]`

### `/restaurants?location=60.123456,24.123456`
Return format: `[Restaurant]`

If the optional `location` query parameter is provided, the restaurants will be sorted by distance from shortest to longest.

**NOTE:** The `Restaurant`s in the response do not include the `Menus` key, use the endpoint below instead.

### `/menus/:restaurantIds`
Return format: `[Restaurant]`

Returns restaurants specified with the id's. The id's have to be separated by commas.

### `/restaurants/:restaurantId/image?day=2016-12-31`
Returns a JPG image of the menu of a restaurant for a specific day. The `day` defaults to the current day.
