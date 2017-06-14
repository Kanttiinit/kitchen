import fetch from 'node-fetch';
import * as aws from './aws';
import {createHash} from 'crypto';

const apiKey = process.env.GOOGLE_STATIC_MAPS_API_KEY;
const mapSize = 256;

const calculateZoom = radius => {
  const equatorLength = 40075004;
  let metersPerPixel = equatorLength / 256;
  let zoomLevel = 1;
  while ((metersPerPixel * mapSize) > radius * 1000) {
    metersPerPixel /= 2;
    ++zoomLevel;
  }
  return zoomLevel;
};

const getMap = async ({latitude, longitude, radius}): Promise<string> => {
  const zoom = calculateZoom(radius) - 1;
  const styles = ['element:labels|visibility:off', 'feature:road|color:black'].join('&style=');
  const requestUrl = `https://maps.googleapis.com/maps/api/staticmap?format=png&size=${mapSize}x${mapSize}&zoom=${zoom}&center=${latitude},${longitude}&key=${apiKey}&style=${styles}`;
  const filename = createHash('sha1').update(requestUrl).digest('hex') + '.png';
  const url = await aws.getUrl(filename);
  if (url) {
    return url;
  }
  const response = await fetch(requestUrl);
  return aws.upload(response.body, filename);
};

export default getMap;
