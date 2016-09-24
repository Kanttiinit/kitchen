import express from 'express';

export default model => {
  const modelName = model.name.toLowerCase();

  const basePath = '/' + modelName + 's';
  const itemPath = basePath + '/:' + modelName;

  return express.Router()
  .param(modelName, (req, res, next) => {
    model.findById(req.params[modelName])
    .then(item => {
      if (item) {
        req[modelName] = item;
        next();
      } else {
        res.status(404).json({message: 'no such ' + modelName});
      }
    });
  })
  .get(basePath, (req, res) =>
    model.findAll().then(items => res.json(items))
  )
  .post(basePath, (req, res) =>
     model.create(req.body).then(item => res.json(item))
  )
  .delete(itemPath, (req, res) =>
     req[modelName].destroy().then(() => res.json({message: 'deleted'}))
  )
  .put(itemPath, (req, res) =>
     req[modelName].update(req.body).then(item => res.json(item))
  );
};
