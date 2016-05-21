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
   "id": Number,
   "name": String,
   "latitude": Number,
   "longitude": Number,
   "locationRadius": Number,
   "Restaurants": [Restaurant]
}
```

### Menu
```js
{
   "day": "YYYY-MM-DD",
   "courses": [
      {
         "title": String,
         "properties": [String]
      }
   ]
}
```

### Restaurant
```js
{
   "id": Number,
   "name": String,
   "url": String,
   "formattedOpeningHours": {
      "mo": String,
      "tu": String,
      "we": String,
      "th": String,
      "fr": String,
      "sa": String,
      "su": String
   },
   "latitude": Number,
   "longitude": Number,
   "address": String,
   "Menus": [Menu]
}
```

## Public Endpoints

### `/areas`

Return format: `[Area]`

### `/restaurants?location=Number,Number`
Return format: `[Restaurant]`

If the optional `location` query parameter is provided, the restaurants will be sorted by distance from shortest to longest.

**NOTE:** The `Restaurant`s in the response do not include the `Menus` key, use the endpoint below instead.

### `/menus/:restaurantIds`
Return format: `[Restaurant]`

Returns restaurants specified by the supplied id's. The id's have to be separated by commas.

### `/restaurants/:restaurantId/image?day=YYYY-MM-DD&mode=[skip-cache|html]&width=Number`
If no `mode` is provided, redirects to an image at AWS. If mode is `html` returns an HTML document. If mode is `skip-cache` the image will be generated and displayed without a redirect. The `day` defaults to the current day.
