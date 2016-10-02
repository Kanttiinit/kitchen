import fetch from 'node-fetch';
import models from '../models';

const getUserModel = fields => models.User.upsert(fields)
  .then(() => models.User.findOne({where: {email: fields.email}}));

const getUserByFacebook = token =>
  fetch(`https://graph.facebook.com/v2.7/me?access_token=${token}&fields=id,name,email,picture`)
  .then(r => r.json())
  .then(data => {
    if (!data.error) {
      return getUserModel({
        email: data.email,
        displayName: data.name,
        photo: data.picture.data.url
      });
    }
  });

const getUserByGoogle = token =>
  fetch('https://www.googleapis.com/plus/v1/people/me?fields=displayName,emails,image', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(r => r.json())
  .then(data => {
    if (!data.error) {
      return getUserModel({
        email: data.emails[0].value,
        displayName: data.displayName,
        photo: data.image.url
      });
    }
  });

export default (req, res, next) => {
  let userPromise;
  const facebookToken = req.query.facebookToken;
  const googleToken = req.query.googleToken;
  if (facebookToken) {
    userPromise = getUserByFacebook(facebookToken);
  } else if (googleToken) {
    userPromise = getUserByGoogle(googleToken);
  }

  if (userPromise) {
    userPromise.then(user => {
      req.session.user = user;
      res.json({message: 'Success.'});
    }).catch(() => {
      next({code: 400, message: 'Authorization error.'});
    });
  } else {
    next({code: 400, message: 'No token.'});
  }
};
