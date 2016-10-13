import express from 'express';
import moment from 'moment';

import models from '../models';
import * as aws from '../utils/aws';
import {getImageStream, renderHtml} from '../image-generator';

export default express.Router()
.get('/restaurants/:restaurantId/menu(.:ext)?', async (req, res, next) => {
  const {restaurantId, ext} = req.params;
  const {width} = req.query;

  const day = moment(req.query.day).format('YYYY-MM-DD');
  const filename = restaurantId + '_' + day + '.png';

  const restaurant = await models.Restaurant.findOne({
    where: { id: restaurantId },
    include: [
      {
        model: models.Menu,
        required: false,
        where: { day }
      }
    ]
  });

  if (!restaurant) {
    next({code: 404, message: 'Not found.'});
  } else if (!ext) {
    res.json(restaurant.getPublicAttributes(req.lang));
  } else if (ext === 'png') {
    let url = await aws.getUrl(filename);
    if (!url) {
      const imageStream = getImageStream(renderHtml(restaurant, day, width));
      url = await aws.upload(imageStream, filename);
    }
    res.redirect(url);
  } else {
    const html = renderHtml(restaurant, day, width);

    if (ext === 'html')
      return res.send(html);

    return getImageStream(html).pipe(res);
  }
});
