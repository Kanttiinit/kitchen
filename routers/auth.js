const passport = require('passport');
const express = require('express');
const {Strategy} = require('passport-facebook');
const models = require('../models');
const _ = require('lodash');

passport.serializeUser((user, done) => {
  done(null, user.email);
});
passport.deserializeUser((email, done) => {
  models.User.find({email})
  .then(user => done(null, user))
  .catch(error => done(error));
});

passport.use(new Strategy(
  {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'emails', 'displayName']
  },
  (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const displayName = profile.displayName;
    models.User.upsert({email, displayName})
    .then(() => models.User.find({email}))
    .then(user => done(null, user))
    .catch(error => done(error));
  }
));

const userRouter = express.Router()
.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).json({message: 'Please log in first.'});
  }
})
.get('/logout', (req, res) => {
  req.logout();
  res.json({success: true});
})
.get('/', (req, res) => res.json(_.pick(req.user, ['displayName', 'email', 'preferences'])))
.put('/preferences', (req, res) => {
  req.user.update({
    preferences: Object.assign({}, req.user.preferences, req.body)
  })
  .then(user => res.json(user.preferences));
});

module.exports = express.Router()
.use('/me', userRouter)
.get('/facebook', passport.authenticate('facebook', {scope: ['email']}))
.get('/facebook/callback', passport.authenticate('facebook', { successRedirect: '/auth/me', failureRedirect: '/login' }));
