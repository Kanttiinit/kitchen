const express = require('express');
const models = require('../models');
const _ = require('lodash');
const fetch = require('node-fetch');

const getUser = fields => models.User.upsert(fields)
  .then(() => models.User.findOne({where: {email: fields.email}}));

const getUserByFacebook = (req, res, next) =>
  fetch(`https://graph.facebook.com/v2.7/me?access_token=${req.params.token}&fields=id,name,email,picture`)
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      next(true);
    } else {
      return getUser({
        email: data.email,
        displayName: data.name,
        photo: data.picture.data.url
      });
    }
  })
  .then(user => {
    req.user = user;
    next();
  });

const getUserByGoogle = (req, res, next) =>
  fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${req.params.token}`)
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      next(true);
    } else {
      return getUser({
        email: data.email,
        displayName: data.name,
        photo: data.picture
      });
    }
  })
  .then(user => {
    req.user = user;
    next();
  });

const sendPublicUser = (req, res) =>
  res.json(_.pick(req.user, ['email', 'displayName', 'preferences', 'photo']));

module.exports = express.Router()
.get('/facebook/:token', getUserByFacebook, sendPublicUser)
.get('/google/:token', getUserByGoogle, sendPublicUser)
.use((err, req, res, next) => res.status(401).json({message: 'Unauthorized.'}));
