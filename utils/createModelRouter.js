const models = require('../models');
const express = require('express');
const parseUser = require('./parseUser');

const getSequelizeQuery = (listQuery, model) => {
  if (listQuery && listQuery.query) {
    return models.sequelize.query(listQuery.query, {
      model,
      mapToModel: true,
      replacements: listQuery.replacements
    });
  } else {
    return model.findAll(listQuery);
  }
};

const getRawModelProps = (model, item) =>
   Object.keys(model.attributes)
   .reduce((carry, attr) => {
      carry[attr] = item[attr];
      return carry;
   }, {});

const getParamParser = (model, modelName) => (req, res, next) => {
   model.findById(req.params[modelName])
   .then(item => {
      if (item) {
         req[modelName] = item;
         next();
      } else {
         res.status(404).json({message: 'no such ' + modelName});
      }
   });
};

const generateResponse = (model, items, lang, loggedIn) =>
  items.map(i => {
     const item = i.getPublicAttributes(lang);

     if (loggedIn) {
        item.raw = getRawModelProps(model, i);
     }

     return item;
  });

const auth = (req, res, next) => {
  if (req.user && req.user.admin) {
    next();
  } else {
    next(true);
  }
}

module.exports = ({model, getListQuery, formatResponse}) => {
  const modelName = model.name.toLowerCase();

  const basePath = '/' + modelName + 's';
  const itemPath = basePath + '/:' + modelName;

  return express.Router()
  .param(modelName, getParamParser(model, modelName))
  .get(basePath, (req, res) => {
     const listQuery = getListQuery && getListQuery(req);

     getSequelizeQuery(listQuery, model).then(items =>
       res.json(generateResponse(model, items, req.lang, req.loggedIn))
     );
  })
  .post(basePath, parseUser, auth, (req, res) =>
     model.create(req.body).then(item => res.json(item))
  )
  .delete(itemPath, parseUser, auth, (req, res) =>
     req[modelName].destroy().then(() => res.json({message: 'deleted'}))
  )
  .put(itemPath, parseUser, auth, (req, res) =>
     req[modelName].update(req.body).then(item => res.json(item))
  );
};
