# Kanttiinit Backend

## Environment Variables for Local Deployment

Key|Description
-|-
DATABASE_URL|URI for the Postgres database
PASSWORD|Hashed password for the admin interface
AWS_ACCESS_KEY_ID|AWS access key id for S3
AWS_SECRET_ACCESS_KEY|AWS access key secret for S3

## Public Endpoints

### `/areas`
Returns all areas and their restaurants.

Return format: `[Area]`

### `/restaurants`
Returns all restaurants.

Return format: `[Restaurant]`

### `/menus/:restaurantIds`

### `/restaurants/:restaurantId/image`
