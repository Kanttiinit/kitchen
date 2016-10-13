import fetch from 'node-fetch';
import models from '../models';

const getUserModel = async fields => {
  await models.User.upsert(fields);
  return models.User.findOne({where: {email: fields.email}});
};

const getUserByFacebook = async token => {
  const data = await fetch(`https://graph.facebook.com/v2.7/me?access_token=${token}&fields=id,name,email,picture`)
  .then(r => r.json());

  if (data.error) {
    throw new Error(data.error);
  }
  
  return getUserModel({
    email: data.email,
    displayName: data.name,
    photo: data.picture.data.url
  });
};

const getUserByGoogle = async token => {
  const data = await fetch('https://www.googleapis.com/plus/v1/people/me?fields=displayName,emails,image', {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(r => r.json());

  if (data.error) {
    throw new Error(data.error);
  }

  return getUserModel({
    email: data.emails[0].value,
    displayName: data.displayName,
    photo: data.image.url
  });
};

const getUser = (provider, token) => {
  if (provider === 'facebook') {
    return getUserByFacebook(token);
  } else if (provider === 'google') {
    return getUserByGoogle(token);
  }
  throw new Error('Unknown provider.');
};

export default async (req, res, next) => {
  const {provider, token} = req.body;

  try {
    const user = await getUser(provider, token);
    req.session.user = user.email;
    res.json({message: 'Success.'});
  } catch (e) {
    next({code: 400, message: e.message || 'Authorization error.'});
  }
};
