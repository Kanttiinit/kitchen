const passport = require('passport');
const express = require('express');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const models = require('../models');
const _ = require('lodash');

passport.serializeUser((user, done) => {
  done(null, user.email);
});
passport.deserializeUser((email, done) => {
  models.User.findOne({where: {email}})
  .then(user => done(null, user))
  .catch(error => done(error));
});

function strategyCallback(accessToken, someOtherToken, profile, done) {
  const email = profile.emails[0].value;
  const displayName = profile.displayName;
  const photo = profile.photos.length ? profile.photos[0].value : undefined;
  models.User.upsert({email, displayName, photo})
  .then(() => models.User.find({email}))
  .then(user => done(null, user))
  .catch(error => done(error));
}

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.HOST + '/auth/facebook/callback',
  profileFields: ['id', 'emails', 'displayName', 'picture']
}, strategyCallback));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CONSUMER_KEY,
  clientSecret: process.env.GOOGLE_CONSUMER_SECRET,
  callbackURL: process.env.HOST + '/auth/google/callback'
}, strategyCallback));

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
.get('/', (req, res) => res.json(_.pick(req.user, ['displayName', 'email', 'preferences', 'photo'])))
// .put('/preferences', (req, res) => {
//   req.user.update({
//     preferences: Object.assign({}, req.user.preferences, req.body)
//   })
//   .then(user => res.json(user.preferences));
// });

const redirects = {
  successRedirect: process.env.AUTH_REDIRECT_SUCCESS,
  failureRedirect: process.env.AUTH_FAILURE_REDIRECT
};

module.exports = express.Router()
.use('/me', userRouter)

.get('/facebook', passport.authenticate('facebook', {scope: ['email']}))
.get('/facebook/callback', passport.authenticate('facebook', redirects))

.get('/google', passport.authenticate('google', { scope: 'email' }))
.get('/google/callback', passport.authenticate('google', redirects));
