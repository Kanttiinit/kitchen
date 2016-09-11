const fetch = require('node-fetch');
const models = require('../models');

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
    console.log(data)
    if (!data.error) {
      return getUserModel({
        email: data.emails[0].value,
        displayName: data.displayName,
        photo: data.image.url
      });
    }
  });

module.exports = (req, res, next) => {
  let userPromise;
  const facebookToken = req.query.facebookToken || req.get('X-FacebookToken');
  const googleToken = req.query.googleToken || req.get('X-GoogleToken');
  if (facebookToken) {
    userPromise = getUserByFacebook(facebookToken);
  } else if (googleToken) {
    userPromise = getUserByGoogle(googleToken);
  }

  if (userPromise) {
    userPromise.then(user => {
      req.user = user;
      next();
    }).catch(e => console.log(e));
  } else {
    next();
  }
};
