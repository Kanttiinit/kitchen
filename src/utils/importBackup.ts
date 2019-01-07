import * as dotenv from 'dotenv';
dotenv.config();
import { readFileSync } from 'fs';
import * as readline from 'readline';
import { promisify } from 'util';
import { unzip } from 'zlib';
import { sequelize, Area, Restaurant, Favorite } from '../models';

const decompress = (promisify as any)(unzip);

async function importFromFile(filename) {
  const fileContents = readFileSync(filename);
  let data;
  try {
    const jsonString = await decompress(
      Buffer.from(fileContents.toString(), 'base64')
    );
    data = JSON.parse(jsonString.toString());
  } catch (e) {
    throw new Error('Could not parse backup file: ' + e);
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question(
    `About to import ${data.areas.length} areas, ${
      data.restaurants.length
    } restaurants, and ${data.favorites.length} favorites, continue? `,
    async answer => {
      if (answer === 'Y' || answer === 'y') {
        console.log('Importing...');
        await importData(data);
      } else {
        console.log('Aborted.');
      }
      rl.close();
    }
  );
}

async function importData({ areas, restaurants, favorites }) {
  console.log('Connecting to DB.');
  await sequelize.sync();
  console.log('Importing areas.');
  await Area.bulkCreate(areas);
  console.log('Importing restaurants.');
  await Restaurant.bulkCreate(restaurants);
  console.log('Importing favorites.');
  await Favorite.bulkCreate(favorites);
  process.exit(0);
}

if (require.main === module) {
  const filename = process.argv[2];
  importFromFile(filename).catch(console.error);
} else {
  throw new Error('This file is not meant to be imported.');
}
