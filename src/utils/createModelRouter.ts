import * as express from 'express';

export default model => {
  const modelName = model.name.toLowerCase();

  const basePath = '/' + modelName + 's';
  const itemPath = basePath + '/:' + modelName;

  return express.Router()
  .param(modelName, async (req, res, next) => {
    const item = await model.findById(req.params[modelName]);
    if (item) {
      req[modelName] = item;
      next();
    } else {
      res.status(404).json({message: 'no such ' + modelName});
    }
  })
  .get(basePath, (req, res) =>
    model.findAll().then(items => res.json(items))
  )
  .post(basePath, async (req, res, next) => {
    try {
      const item = await model.create(req.body);
      res.json(item);
    } catch (e) {
      next({
        code: 401,
        message: 'Validation error: ' + e.message
      });
    }
  })
  .delete(itemPath, (req, res) =>
     req[modelName].destroy().then(() => res.json({message: 'deleted'}))
  )
  .put(itemPath, (req, res) =>
     req[modelName].update(req.body).then(item => res.json(item))
  );
};
