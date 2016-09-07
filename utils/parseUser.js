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
  fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`)
  .then(r => r.json())
  .then(data => {
    if (!data.error_description) {
      return getUserModel({
        email: data.email,
        displayName: data.name,
        photo: data.picture
      });
    }
  });

module.exports = (req, res, next) => {
  let userPromise;
  if (req.query.facebookToken) {
    userPromise = getUserByFacebook(req.query.facebookToken);
  } else if (req.query.googleToken) {
    userPromise = getUserByGoogle(req.query.googleToken);
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
