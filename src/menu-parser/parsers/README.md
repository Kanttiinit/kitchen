# Parsers

## Development

After you have installed everything with `yarn install` you can start watching for changes with `yarn watch:ts`. The compiled JavaScript will end up in the `dist` folder. To test a parser for a certain URL just run `node dist/menu-parser http://restaurant.com/menu`. The output will be printed to the console.

## Normalizing properties

Parsers are, among other things, responsible of converting properties to the Kanttiinit standard™️:

| Property | Meaning            |
| -------- | ------------------ |
| A+       | contains allergens |
| C+       | contains celery    |
| E        | egg-free           |
| G        | gluten-free        |
| H        | healthier choice   |
| L        | lactose-free       |
| LL       | low in lactose     |
| M        | milk-free          |
| N+       | contains nuts      |
| O+       | contains garlic    |
| S        | soy-free           |
| S+       | contains soy       |
| V        | vegetarian         |
| VV       | vegan              |
